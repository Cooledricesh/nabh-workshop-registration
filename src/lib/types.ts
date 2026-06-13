export type SessionSlot = 'morning' | 'afternoon';

export type WorkshopAvailability = {
  id: string;
  title: string;
  slot: SessionSlot;
  capacity: number;
  registeredCount: number;
  isOpen: boolean;
};

export type ParticipantDraft = {
  name: string;
  affiliation: string;
  position: string;
  workshopIds: string[];
};

export type RegistrationRow = {
  id: string;
  createdAt: string;
  name: string;
  affiliation: string;
  position: string;
  workshops: { id: string; title: string; slot: SessionSlot }[];
};
