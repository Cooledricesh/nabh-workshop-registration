create extension if not exists pgcrypto;

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  slot text not null check (slot in ('morning', 'afternoon')),
  capacity integer not null check (capacity >= 0),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registration_groups (
  id uuid primary key default gen_random_uuid(),
  representative_name text not null check (length(trim(representative_name)) > 0),
  password text not null check (length(trim(password)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.registration_groups(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  affiliation text not null check (length(trim(affiliation)) > 0),
  "position" text not null check (length(trim("position")) > 0),
  created_at timestamptz not null default now()
);

alter table public.registrations
  add column if not exists group_id uuid references public.registration_groups(id) on delete cascade;

do $$
declare
  legacy record;
  new_group_id uuid;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'password'
  ) then
    for legacy in execute $legacy_sql$
      select id, name, password
      from public.registrations
      where group_id is null
        and coalesce(password, '') <> ''
    $legacy_sql$ loop
      insert into public.registration_groups (representative_name, password)
      values (legacy.name, legacy.password)
      returning id into new_group_id;

      update public.registrations
      set group_id = new_group_id
      where id = legacy.id;
    end loop;
  end if;
end;
$$;

alter table public.registrations drop column if exists password;

create table if not exists public.registration_workshops (
  registration_id uuid not null references public.registrations(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  primary key (registration_id, workshop_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workshops_touch_updated_at on public.workshops;
create trigger workshops_touch_updated_at
before update on public.workshops
for each row execute function public.touch_updated_at();

create or replace view public.workshops_with_counts as
select
  w.id,
  w.title,
  w.slot,
  w.capacity,
  w.is_open,
  w.created_at,
  w.updated_at,
  count(rw.registration_id)::integer as registration_count
from public.workshops w
left join public.registration_workshops rw on rw.workshop_id = w.id
group by w.id;

drop function if exists public.register_participants_batch(jsonb);
drop function if exists public.register_participants_batch(text, text, jsonb);

create or replace function public.register_participants_batch(
  representative_name_input text,
  representative_password_input text,
  participants_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_ids uuid[] := '{}';
  current_group_id uuid;
  current_registration_id uuid;
  participant record;
begin
  if length(trim(coalesce(representative_name_input, ''))) = 0 then
    raise exception '대표자 이름을 입력해 주세요.';
  end if;

  if length(trim(coalesce(representative_password_input, ''))) = 0 then
    raise exception '조회용 비밀번호를 입력해 주세요.';
  end if;

  if jsonb_typeof(participants_payload) <> 'array' or jsonb_array_length(participants_payload) = 0 then
    raise exception '참가자를 1명 이상 입력해 주세요.';
  end if;

  create temp table tmp_participants (
    row_no integer primary key,
    name text not null,
    affiliation text not null,
    "position" text not null,
    workshop_ids uuid[] not null
  ) on commit drop;

  insert into tmp_participants (row_no, name, affiliation, "position", workshop_ids)
  select
    item.ordinality::integer,
    trim(item.value ->> 'name'),
    trim(item.value ->> 'affiliation'),
    trim(item.value ->> 'position'),
    coalesce(array(
      select distinct value::uuid
      from jsonb_array_elements_text(coalesce(item.value -> 'workshopIds', '[]'::jsonb))
      where value <> ''
    ), '{}')
  from jsonb_array_elements(participants_payload) with ordinality as item(value, ordinality);

  if exists (select 1 from tmp_participants where name = '' or affiliation = '' or "position" = '') then
    raise exception '참가자 이름, 소속, 직책은 모두 필수입니다.';
  end if;

  perform 1
  from public.workshops
  where id in (select unnest(workshop_ids) from tmp_participants)
  for update;

  if exists (
    select 1
    from tmp_participants tp
    cross join unnest(tp.workshop_ids) selected(workshop_id)
    left join public.workshops w on w.id = selected.workshop_id
    where w.id is null
  ) then
    raise exception '알 수 없는 워크숍입니다.';
  end if;

  if exists (
    select 1
    from tmp_participants tp
    cross join unnest(tp.workshop_ids) selected(workshop_id)
    join public.workshops w on w.id = selected.workshop_id
    group by tp.row_no, w.slot
    having count(*) > 1
  ) then
    raise exception '한 참가자는 오전 1개, 오후 1개까지만 선택할 수 있습니다.';
  end if;

  if exists (
    select 1
    from tmp_participants tp
    cross join unnest(tp.workshop_ids) selected(workshop_id)
    join public.workshops w on w.id = selected.workshop_id
    left join public.registration_workshops rw on rw.workshop_id = w.id
    group by w.id, w.title, w.capacity, w.is_open
    having (not w.is_open) or count(rw.registration_id) >= w.capacity
  ) then
    raise exception '선택한 워크숍 중 마감된 항목이 있습니다.';
  end if;

  if exists (
    with demand as (
      select selected.workshop_id, count(*)::integer as requested
      from tmp_participants tp
      cross join unnest(tp.workshop_ids) selected(workshop_id)
      group by selected.workshop_id
    ), current_counts as (
      select w.id, w.title, w.capacity, count(rw.registration_id)::integer as registered_count
      from public.workshops w
      left join public.registration_workshops rw on rw.workshop_id = w.id
      where w.id in (select workshop_id from demand)
      group by w.id
    )
    select 1
    from demand d
    join current_counts c on c.id = d.workshop_id
    where d.requested > greatest(c.capacity - c.registered_count, 0)
  ) then
    raise exception '선택한 워크숍의 남은 좌석이 부족합니다. 전체 신청이 취소되었습니다.';
  end if;

  insert into public.registration_groups (representative_name, password)
  values (trim(representative_name_input), trim(representative_password_input))
  returning id into current_group_id;

  for participant in select * from tmp_participants order by row_no loop
    insert into public.registrations (group_id, name, affiliation, "position")
    values (current_group_id, participant.name, participant.affiliation, participant."position")
    returning id into current_registration_id;

    inserted_ids := array_append(inserted_ids, current_registration_id);

    insert into public.registration_workshops (registration_id, workshop_id)
    select current_registration_id, workshop_id
    from unnest(participant.workshop_ids) as selected(workshop_id);
  end loop;

  return jsonb_build_object('group_id', current_group_id, 'registration_ids', inserted_ids);
end;
$$;

drop function if exists public.find_registrations_by_name_password(text, text);

create or replace function public.find_registrations_by_name_password(lookup_name text, lookup_password text)
returns table (
  group_id uuid,
  id uuid,
  created_at timestamptz,
  name text,
  affiliation text,
  "position" text,
  workshops jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    g.id as group_id,
    r.id,
    r.created_at,
    r.name,
    r.affiliation,
    r."position",
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', w.id, 'title', w.title, 'slot', w.slot)
        order by w.slot desc, w.created_at asc
      ) filter (where w.id is not null),
      '[]'::jsonb
    ) as workshops
  from public.registration_groups g
  join public.registrations r on r.group_id = g.id
  left join public.registration_workshops rw on rw.registration_id = r.id
  left join public.workshops w on w.id = rw.workshop_id
  where g.representative_name = trim(lookup_name)
    and g.password = trim(lookup_password)
  group by g.id, r.id
  order by r.created_at asc;
$$;

drop function if exists public.update_registration_workshops(text, text, uuid, jsonb);

create or replace function public.update_registration_workshops(
  lookup_name text,
  lookup_password text,
  target_registration_id uuid,
  workshop_ids_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group_id uuid;
begin
  select g.id into target_group_id
  from public.registration_groups g
  join public.registrations r on r.group_id = g.id
  where g.representative_name = trim(lookup_name)
    and g.password = trim(lookup_password)
    and r.id = target_registration_id;

  if target_group_id is null then
    raise exception '일치하는 등록 내역이 없습니다.';
  end if;

  create temp table tmp_selected_workshops (
    workshop_id uuid primary key
  ) on commit drop;

  insert into tmp_selected_workshops (workshop_id)
  select distinct value::uuid
  from jsonb_array_elements_text(coalesce(workshop_ids_payload, '[]'::jsonb))
  where value <> '';

  perform 1
  from public.workshops
  where id in (select workshop_id from tmp_selected_workshops)
  for update;

  if exists (
    select 1
    from tmp_selected_workshops s
    left join public.workshops w on w.id = s.workshop_id
    where w.id is null
  ) then
    raise exception '알 수 없는 워크숍입니다.';
  end if;

  if exists (
    select 1
    from tmp_selected_workshops s
    join public.workshops w on w.id = s.workshop_id
    group by w.slot
    having count(*) > 1
  ) then
    raise exception '오전 1개, 오후 1개까지만 선택할 수 있습니다.';
  end if;

  if exists (
    select 1
    from tmp_selected_workshops s
    join public.workshops w on w.id = s.workshop_id
    left join public.registration_workshops rw
      on rw.workshop_id = w.id
     and rw.registration_id <> target_registration_id
    group by w.id, w.capacity, w.is_open
    having (not w.is_open) or count(rw.registration_id) >= w.capacity
  ) then
    raise exception '선택한 워크숍 중 마감된 항목이 있습니다.';
  end if;

  delete from public.registration_workshops
  where registration_id = target_registration_id;

  insert into public.registration_workshops (registration_id, workshop_id)
  select target_registration_id, workshop_id
  from tmp_selected_workshops;

  return true;
end;
$$;

alter table public.workshops enable row level security;
alter table public.registration_groups enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_workshops enable row level security;

drop policy if exists "public can read workshops" on public.workshops;
create policy "public can read workshops" on public.workshops for select using (true);

drop policy if exists "public can read workshop counts" on public.registration_workshops;
create policy "public can read workshop counts" on public.registration_workshops for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.workshops, public.workshops_with_counts to anon, authenticated;
grant execute on function public.register_participants_batch(text, text, jsonb) to anon, authenticated;
grant execute on function public.find_registrations_by_name_password(text, text) to anon, authenticated;
grant execute on function public.update_registration_workshops(text, text, uuid, jsonb) to anon, authenticated;

delete from public.workshops
where title in (
  '오전 워크숍 A', '오전 워크숍 B', '오전 워크숍 C',
  '오후 워크숍 A', '오후 워크숍 B', '오후 워크숍 C', '오후 워크숍 D',
  '회복지향 낮병원 운영 워크숍', '가족·지역사회 연계 워크숍', '위기대응 및 사례관리 워크숍'
);

insert into public.workshops (id, title, slot, capacity, is_open)
values
  ('11111111-1111-4111-8111-111111111111', 'Quality Rights(아주대)', 'morning', 25, true),
  ('22222222-2222-4222-8222-222222222222', 'Personal Medicine(대동병원)', 'morning', 25, true),
  ('33333333-3333-4333-8333-333333333333', '미술치료의 이해(이음병원)', 'morning', 25, true),
  ('44444444-4444-4444-8444-444444444444', 'V-cat(대동병원)', 'afternoon', 25, true),
  ('55555555-5555-4555-8555-555555555555', '음악치료의 이해(이음병원)', 'afternoon', 25, true),
  ('66666666-6666-4666-8666-666666666666', '행복한 미술(다움병원)', 'afternoon', 25, true),
  ('77777777-7777-4777-8777-777777777777', '슐렌(참사랑병원)', 'afternoon', 25, true)
on conflict (id) do update set
  title = excluded.title,
  slot = excluded.slot,
  capacity = excluded.capacity,
  is_open = excluded.is_open;

notify pgrst, 'reload schema';
