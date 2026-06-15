import { describe, expect, it } from 'vitest';
import {
  RegistrationValidationError,
  summarizeWorkshopDemand,
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
  password: '1234',
  workshopIds: [],
};

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
