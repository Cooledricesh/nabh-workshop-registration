'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearAdminSession, isAdminAuthenticated, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';
import { createWorkshop, deleteWorkshop, lookupRegistrations, registerParticipants, updateWorkshop } from '@/lib/data';
import { validateBatchRegistration } from '@/lib/registration';
import type { ParticipantDraft, RegistrationLookupResult, SessionSlot, WorkshopAvailability } from '@/lib/types';

export type ActionState = { ok: boolean; message: string };
export type LookupState = ActionState & { results: RegistrationLookupResult[] };

function parseParticipants(raw: FormDataEntryValue | null): ParticipantDraft[] {
  if (typeof raw !== 'string') {
    throw new Error('참가자 데이터가 없습니다.');
  }
  const parsed = JSON.parse(raw) as ParticipantDraft[];
  return parsed.map((participant) => ({
    name: participant.name.trim(),
    affiliation: participant.affiliation.trim(),
    position: participant.position.trim(),
    password: participant.password.trim(),
    workshopIds: Array.from(new Set(participant.workshopIds.filter(Boolean))),
  }));
}

function parseWorkshops(raw: FormDataEntryValue | null): WorkshopAvailability[] {
  if (typeof raw !== 'string') {
    throw new Error('워크숍 데이터가 없습니다. 새로고침 후 다시 시도해 주세요.');
  }
  return JSON.parse(raw) as WorkshopAvailability[];
}

export async function submitRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const participants = parseParticipants(formData.get('participants'));
    const workshops = parseWorkshops(formData.get('workshops'));
    validateBatchRegistration(participants, workshops);
    await registerParticipants(participants);
    revalidatePath('/workshops');
    revalidatePath('/admin');
    return { ok: true, message: `${participants.length}명 등록이 완료되었습니다.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '등록에 실패했습니다.' };
  }
}

export async function lookupRegistrationAction(_prev: LookupState, formData: FormData): Promise<LookupState> {
  try {
    const name = String(formData.get('name') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();
    if (!name || !password) {
      return { ok: false, message: '이름과 비밀번호를 모두 입력해 주세요.', results: [] };
    }
    const results = await lookupRegistrations({ name, password });
    if (results.length === 0) {
      return { ok: false, message: '일치하는 등록 내역이 없습니다.', results: [] };
    }
    return { ok: true, message: `${results.length}건의 등록 내역을 찾았습니다.`, results };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '등록 내역 조회에 실패했습니다.', results: [] };
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
