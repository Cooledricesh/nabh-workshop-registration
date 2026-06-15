import type { ParticipantDraft, RepresentativeCredentials, SessionSlot, WorkshopAvailability } from './types';

export type { ParticipantDraft, RepresentativeCredentials, SessionSlot, WorkshopAvailability } from './types';

export class RegistrationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationValidationError';
  }
}

export type BatchValidationResult = {
  ok: true;
  participants: ParticipantDraft[];
  demandByWorkshop: Map<string, number>;
};

export function validateRepresentativeCredentials(input: RepresentativeCredentials): RepresentativeCredentials {
  const name = input.name.trim();
  const password = input.password.trim();
  if (!name) {
    throw new RegistrationValidationError('대표자 이름을 입력해 주세요.');
  }
  if (!password) {
    throw new RegistrationValidationError('조회용 비밀번호를 입력해 주세요.');
  }
  return { name, password };
}

export function summarizeWorkshopDemand(participants: ParticipantDraft[]): Map<string, number> {
  const demand = new Map<string, number>();

  for (const participant of participants) {
    for (const workshopId of participant.workshopIds) {
      demand.set(workshopId, (demand.get(workshopId) ?? 0) + 1);
    }
  }

  return demand;
}

export function validateBatchRegistration(
  participants: ParticipantDraft[],
  workshops: WorkshopAvailability[],
): BatchValidationResult {
  if (participants.length === 0) {
    throw new RegistrationValidationError('참가자를 1명 이상 입력해 주세요.');
  }

  const workshopById = new Map(workshops.map((workshop) => [workshop.id, workshop]));

  for (const [index, participant] of participants.entries()) {
    const rowLabel = `${index + 1}번째 참가자`;
    if (!participant.name.trim()) {
      throw new RegistrationValidationError(`${rowLabel}: 이름을 입력해 주세요.`);
    }
    if (!participant.affiliation.trim()) {
      throw new RegistrationValidationError(`${rowLabel}: 소속을 입력해 주세요.`);
    }
    if (!participant.position.trim()) {
      throw new RegistrationValidationError(`${rowLabel}: 직책을 입력해 주세요.`);
    }
    const selectedSlots = new Map<SessionSlot, string>();
    const uniqueWorkshopIds = new Set(participant.workshopIds.filter(Boolean));

    for (const workshopId of uniqueWorkshopIds) {
      const workshop = workshopById.get(workshopId);
      if (!workshop) {
        throw new RegistrationValidationError(`${rowLabel}: 알 수 없는 워크숍입니다.`);
      }

      if (!workshop.isOpen || workshop.registeredCount >= workshop.capacity) {
        throw new RegistrationValidationError(`${workshop.title} 워크숍은 마감되었습니다.`);
      }

      const previous = selectedSlots.get(workshop.slot);
      if (previous) {
        const slotLabel = workshop.slot === 'morning' ? '오전' : '오후';
        throw new RegistrationValidationError(`${rowLabel}: ${slotLabel} 워크숍은 1개만 선택할 수 있습니다.`);
      }
      selectedSlots.set(workshop.slot, workshopId);
    }
  }

  const demandByWorkshop = summarizeWorkshopDemand(
    participants.map((participant) => ({
      ...participant,
      workshopIds: Array.from(new Set(participant.workshopIds.filter(Boolean))),
    })),
  );

  for (const [workshopId, requested] of demandByWorkshop.entries()) {
    const workshop = workshopById.get(workshopId);
    if (!workshop) {
      throw new RegistrationValidationError('알 수 없는 워크숍입니다.');
    }
    const remaining = Math.max(workshop.capacity - workshop.registeredCount, 0);
    if (requested > remaining) {
      throw new RegistrationValidationError(
        `${workshop.title} 남은 좌석 ${remaining}명, 신청 ${requested}명입니다. 전체 신청이 취소되었습니다.`,
      );
    }
  }

  return { ok: true, participants, demandByWorkshop };
}

export function getRemainingSeats(workshop: WorkshopAvailability): number {
  return Math.max(workshop.capacity - workshop.registeredCount, 0);
}

export function isWorkshopSelectable(workshop: WorkshopAvailability): boolean {
  return workshop.isOpen && getRemainingSeats(workshop) > 0;
}
