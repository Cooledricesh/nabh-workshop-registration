'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearAdminSession, isAdminAuthenticated, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';
import {
  createWorkshop,
  deleteWorkshop,
  listWorkshops,
  lookupRegistrations,
  registerParticipants,
  updateRegistrationWorkshops,
  updateWorkshop,
} from '@/lib/data';
import { validateBatchRegistration, validateRepresentativeCredentials } from '@/lib/registration';
import type { ParticipantDraft, RegistrationLookupResult, RepresentativeCredentials, SessionSlot, WorkshopAvailability } from '@/lib/types';

export type ActionState = { ok: boolean; message: string };
export type LookupState = ActionState & {
  results: RegistrationLookupResult[];
  workshops: WorkshopAvailability[];
  credentials?: RepresentativeCredentials;
};

function parseParticipants(raw: FormDataEntryValue | null): ParticipantDraft[] {
  if (typeof raw !== 'string') {
    throw new Error('참가자 데이터가 없습니다.');
  }
  const parsed = JSON.parse(raw) as ParticipantDraft[];
  return parsed.map((participant) => ({
    name: participant.name.trim(),
    affiliation: participant.affiliation.trim(),
    position: participant.position.trim(),
    workshopIds: Array.from(new Set(participant.workshopIds.filter(Boolean))),
  }));
}

function parseWorkshops(raw: FormDataEntryValue | null): WorkshopAvailability[] {
  if (typeof raw !== 'string') {
    throw new Error('워크숍 데이터가 없습니다. 새로고침 후 다시 시도해 주세요.');
  }
  return JSON.parse(raw) as WorkshopAvailability[];
}

function parseRepresentative(formData: FormData): RepresentativeCredentials {
  return validateRepresentativeCredentials({
    name: String(formData.get('representativeName') ?? formData.get('name') ?? ''),
    password: String(formData.get('representativePassword') ?? formData.get('password') ?? ''),
  });
}

function parseWorkshopIds(formData: FormData): string[] {
  return Array.from(new Set(formData.getAll('workshopIds').map(String).filter(Boolean)));
}

export async function submitRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const representative = parseRepresentative(formData);
    const participants = parseParticipants(formData.get('participants'));
    const workshops = parseWorkshops(formData.get('workshops'));
    validateBatchRegistration(participants, workshops);
    await registerParticipants(representative, participants);
    revalidatePath('/workshops');
    revalidatePath('/lookup');
    revalidatePath('/admin');
    return { ok: true, message: `${participants.length}명 등록이 완료되었습니다. 대표자 이름과 비밀번호로 전체 신청 내역을 조회할 수 있습니다.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '등록에 실패했습니다.' };
  }
}

export async function lookupRegistrationAction(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const workshops = await listWorkshops();
  try {
    const representative = parseRepresentative(formData);
    const intent = String(formData.get('intent') ?? 'lookup');

    if (intent === 'update') {
      const registrationId = String(formData.get('registrationId') ?? '');
      if (!registrationId) {
        return { ok: false, message: '수정할 참가자를 찾을 수 없습니다.', results: [], workshops, credentials: representative };
      }
      await updateRegistrationWorkshops({
        ...representative,
        registrationId,
        workshopIds: parseWorkshopIds(formData),
      });
      revalidatePath('/workshops');
      revalidatePath('/lookup');
      revalidatePath('/admin');
    }

    const results = await lookupRegistrations(representative);
    if (results.length === 0) {
      return { ok: false, message: '일치하는 등록 내역이 없습니다.', results: [], workshops, credentials: representative };
    }

    return {
      ok: true,
      message: intent === 'update' ? '워크숍 신청 내역을 변경했습니다.' : `${results.length}명의 등록 내역을 찾았습니다.`,
      results,
      workshops,
      credentials: representative,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '등록 내역 처리에 실패했습니다.', results: [], workshops };
  }
}

export async function loginAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '');
  if (!(await verifyAdminPassword(password))) {
    return { ok: false, message: '관리자 비밀번호가 올바르지 않습니다.' };
  }
  await setAdminSession();
  redirect('/admin');
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect('/admin');
}

function parseWorkshopForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slot = String(formData.get('slot') ?? 'morning') as SessionSlot;
  const capacity = Number(formData.get('capacity') ?? 0);
  const isOpen = formData.get('isOpen') === 'on';
  if (!title) throw new Error('워크숍 제목을 입력해 주세요.');
  if (slot !== 'morning' && slot !== 'afternoon') throw new Error('세션이 올바르지 않습니다.');
  if (!Number.isInteger(capacity) || capacity < 0) throw new Error('정원은 0 이상의 정수여야 합니다.');
  return { title, slot, capacity, isOpen };
}

async function assertAdminAction() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('관리자 인증이 필요합니다.');
  }
}

export async function createWorkshopAction(formData: FormData) {
  await assertAdminAction();
  await createWorkshop(parseWorkshopForm(formData));
  revalidatePath('/workshops');
  revalidatePath('/admin');
}

export async function updateWorkshopAction(formData: FormData) {
  await assertAdminAction();
  const id = String(formData.get('id') ?? '');
  await updateWorkshop({ id, ...parseWorkshopForm(formData) });
  revalidatePath('/workshops');
  revalidatePath('/admin');
}

export async function deleteWorkshopAction(formData: FormData) {
  await assertAdminAction();
  const id = String(formData.get('id') ?? '');
  await deleteWorkshop(id);
  revalidatePath('/workshops');
  revalidatePath('/admin');
}
