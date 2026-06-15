import { describe, expect, it } from 'vitest';
import {
  getWorkshopCapacityNotice,
  RegistrationValidationError,
  summarizeWorkshopDemand,
  validateRepresentativeCredentials,
  validateBatchRegistration,
  type ParticipantDraft,
  type WorkshopAvailability,
} from './registration';

const workshops: WorkshopAvailability[] = [
  { id: 'm1', title: 'Morning A', slot: 'morning', capacity: 25, registeredCount: 23, isOpen: true },
  { id: 'm2', title: 'Morning B', slot: 'morning', capacity: 25, registeredCount: 0, isOpen: true },
  { id: 'a1', title: 'Afternoon A', slot: 'afternoon', capacity: 25, registeredCount: 24, isOpen: true },
  { id: 'a2', title: 'Afternoon B', slot: 'afternoon', capacity: 25, registeredCount: 25, isOpen: true },
  { id: 'm3', title: 'Closed Morning', slot: 'morning', capacity: 25, registeredCount: 0, isOpen: false },
];

const baseParticipant: ParticipantDraft = {
  name: '홍길동',
  affiliation: '낮병원',
  position: '전문의',
  workshopIds: [],
};

describe('validateRepresentativeCredentials', () => {
  it('requires one representative name and lookup password for the whole batch', () => {
    expect(validateRepresentativeCredentials({ name: ' 대표자 ', password: ' 1234 ' })).toEqual({
      name: '대표자',
      password: '1234',
    });

    expect(() => validateRepresentativeCredentials({ name: '', password: '1234' })).toThrow('대표자 이름');
    expect(() => validateRepresentativeCredentials({ name: '대표자', password: '' })).toThrow('조회용 비밀번호');
  });
});

describe('validateBatchRegistration', () => {
  it('allows zero workshops and one workshop per time slot', () => {
    const result = validateBatchRegistration(
      [
        baseParticipant,
        { ...baseParticipant, name: '김영희', workshopIds: ['m1', 'a1'] },
      ],
      workshops,
    );

    expect(result.ok).toBe(true);
    expect(result.participants).toHaveLength(2);
  });

  it('rejects one participant selecting two workshops in the same slot', () => {
    expect(() =>
      validateBatchRegistration(
        [{ ...baseParticipant, workshopIds: ['m1', 'm2'] }],
        workshops,
      ),
    ).toThrow(RegistrationValidationError);
  });

  it('rejects the whole batch when workshop demand exceeds remaining capacity', () => {
    expect(() =>
      validateBatchRegistration(
        [
          { ...baseParticipant, name: 'A', workshopIds: ['a1'] },
          { ...baseParticipant, name: 'B', workshopIds: ['a1'] },
        ],
        workshops,
      ),
    ).toThrow('Afternoon A 남은 좌석 1명, 신청 2명');
  });

  it('rejects closed or full workshops', () => {
    expect(() =>
      validateBatchRegistration(
        [{ ...baseParticipant, workshopIds: ['m3'] }],
        workshops,
      ),
    ).toThrow('마감');

    expect(() =>
      validateBatchRegistration(
        [{ ...baseParticipant, workshopIds: ['a2'] }],
        workshops,
      ),
    ).toThrow('마감');
  });
});

describe('summarizeWorkshopDemand', () => {
  it('counts selected workshops across all participants', () => {
    expect(
      summarizeWorkshopDemand([
        { ...baseParticipant, workshopIds: ['m1'] },
        { ...baseParticipant, workshopIds: ['m1', 'a1'] },
      ]),
    ).toEqual(new Map([
      ['m1', 2],
      ['a1', 1],
    ]));
  });
});

describe('getWorkshopCapacityNotice', () => {
  it('hides capacity counts until only five or fewer seats remain', () => {
    expect(getWorkshopCapacityNotice({ id: 'x', title: 'Roomy', slot: 'morning', capacity: 25, registeredCount: 19, isOpen: true })).toBeNull();
    expect(getWorkshopCapacityNotice({ id: 'x', title: 'Nearly Full', slot: 'morning', capacity: 25, registeredCount: 20, isOpen: true })).toBe('마감 임박 · 잔여 5명');
    expect(getWorkshopCapacityNotice({ id: 'x', title: 'Full', slot: 'morning', capacity: 25, registeredCount: 25, isOpen: true })).toBe('마감');
  });
});
