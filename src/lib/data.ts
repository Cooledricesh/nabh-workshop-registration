import 'server-only';

import type { RegistrationLookupResult, RegistrationRow, RepresentativeCredentials, SessionSlot, WorkshopAvailability } from './types';
import { getSupabaseServerClient } from './supabase';

type WorkshopRow = {
  id: string;
  title: string;
  slot: SessionSlot;
  capacity: number;
  is_open: boolean;
  registration_count?: number;
};

type RegistrationWorkshopRow = {
  workshops: { id: string; title: string; slot: SessionSlot } | { id: string; title: string; slot: SessionSlot }[] | null;
};

type RegistrationDataRow = {
  id: string;
  created_at: string;
  name: string;
  affiliation: string;
  position: string;
  registration_workshops: RegistrationWorkshopRow[] | null;
};

type RegistrationLookupRow = {
  group_id: string;
  id: string;
  created_at: string;
  name: string;
  affiliation: string;
  position: string;
  workshops: { id: string; title: string; slot: SessionSlot }[] | null;
};

function toAvailability(row: WorkshopRow): WorkshopAvailability {
  return {
    id: row.id,
    title: row.title,
    slot: row.slot,
    capacity: row.capacity,
    registeredCount: row.registration_count ?? 0,
    isOpen: row.is_open,
  };
}

function normalizeWorkshops(workshops: { id: string; title: string; slot: SessionSlot }[] | null | undefined) {
  return (workshops ?? []).map((workshop) => ({ id: workshop.id, title: workshop.title, slot: workshop.slot }));
}

export async function listWorkshops(): Promise<WorkshopAvailability[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('workshops_with_counts')
    .select('*')
    .order('slot', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as WorkshopRow[]).map(toAvailability);
}

export async function createWorkshop(input: { title: string; slot: SessionSlot; capacity: number; isOpen: boolean }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('workshops').insert({
    title: input.title,
    slot: input.slot,
    capacity: input.capacity,
    is_open: input.isOpen,
  });
  if (error) throw new Error(error.message);
}

export async function updateWorkshop(input: { id: string; title: string; slot: SessionSlot; capacity: number; isOpen: boolean }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('workshops')
    .update({ title: input.title, slot: input.slot, capacity: input.capacity, is_open: input.isOpen })
    .eq('id', input.id);
  if (error) throw new Error(error.message);
}

export async function deleteWorkshop(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('workshops').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function registerParticipants(representative: RepresentativeCredentials, participants: unknown) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc('register_participants_batch', {
    representative_name_input: representative.name,
    representative_password_input: representative.password,
    participants_payload: participants,
  });

  if (error) throw new Error(error.message);
  return data as { group_id: string; registration_ids: string[] };
}

export async function lookupRegistrations(input: RepresentativeCredentials): Promise<RegistrationLookupResult[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc('find_registrations_by_name_password', {
    lookup_name: input.name,
    lookup_password: input.password,
  });

  if (error) throw new Error(error.message);

  return (data as RegistrationLookupRow[]).map((row) => ({
    groupId: row.group_id,
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    affiliation: row.affiliation,
    position: row.position,
    workshops: normalizeWorkshops(row.workshops),
    passwordMatched: true,
  }));
}

export async function updateRegistrationWorkshops(input: RepresentativeCredentials & { registrationId: string; workshopIds: string[] }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.rpc('update_registration_workshops', {
    lookup_name: input.name,
    lookup_password: input.password,
    target_registration_id: input.registrationId,
    workshop_ids_payload: input.workshopIds,
  });

  if (error) throw new Error(error.message);
}

export async function deleteRegistration(input: RepresentativeCredentials & { registrationId: string }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.rpc('delete_registration', {
    lookup_name: input.name,
    lookup_password: input.password,
    target_registration_id: input.registrationId,
  });

  if (error) throw new Error(error.message);
}

export async function listRegistrations(): Promise<RegistrationRow[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('registrations')
    .select('id,created_at,name,affiliation,position,registration_workshops(workshops(id,title,slot))')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as RegistrationDataRow[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    affiliation: row.affiliation,
    position: row.position,
    workshops: (row.registration_workshops ?? [])
      .flatMap((entry) => (Array.isArray(entry.workshops) ? entry.workshops : entry.workshops ? [entry.workshops] : []))
      .map((workshop) => ({ id: workshop.id, title: workshop.title, slot: workshop.slot })),
  }));
}
