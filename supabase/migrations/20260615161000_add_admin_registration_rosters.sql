drop function if exists public.list_admin_registrations();

create or replace function public.list_admin_registrations()
returns table (
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
  from public.registrations r
  left join public.registration_workshops rw on rw.registration_id = r.id
  left join public.workshops w on w.id = rw.workshop_id
  group by r.id
  order by r.created_at desc;
$$;

drop function if exists public.list_admin_workshop_registrants();

create or replace function public.list_admin_workshop_registrants()
returns table (
  workshop_id uuid,
  title text,
  slot text,
  capacity integer,
  registration_count integer,
  registrants jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    w.id as workshop_id,
    w.title,
    w.slot,
    w.capacity,
    count(r.id)::integer as registration_count,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'createdAt', r.created_at,
          'name', r.name,
          'affiliation', r.affiliation,
          'position', r."position"
        )
        order by r.created_at asc
      ) filter (where r.id is not null),
      '[]'::jsonb
    ) as registrants
  from public.workshops w
  left join public.registration_workshops rw on rw.workshop_id = w.id
  left join public.registrations r on r.id = rw.registration_id
  group by w.id
  order by w.slot desc, w.created_at asc;
$$;

grant execute on function public.list_admin_registrations() to anon, authenticated;
grant execute on function public.list_admin_workshop_registrants() to anon, authenticated;

notify pgrst, 'reload schema';
