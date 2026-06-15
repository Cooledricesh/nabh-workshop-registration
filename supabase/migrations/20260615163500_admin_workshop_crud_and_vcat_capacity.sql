drop function if exists public.admin_create_workshop(text, text, integer, boolean);

create or replace function public.admin_create_workshop(
  title_input text,
  slot_input text,
  capacity_input integer,
  is_open_input boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if trim(coalesce(title_input, '')) = '' then
    raise exception '워크숍 제목을 입력해 주세요.';
  end if;
  if slot_input not in ('morning', 'afternoon') then
    raise exception '세션이 올바르지 않습니다.';
  end if;
  if capacity_input < 0 then
    raise exception '정원은 0 이상의 정수여야 합니다.';
  end if;

  insert into public.workshops (title, slot, capacity, is_open)
  values (trim(title_input), slot_input, capacity_input, coalesce(is_open_input, false))
  returning id into new_id;

  return new_id;
end;
$$;

drop function if exists public.admin_update_workshop(uuid, text, text, integer, boolean);

create or replace function public.admin_update_workshop(
  workshop_id uuid,
  title_input text,
  slot_input text,
  capacity_input integer,
  is_open_input boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if trim(coalesce(title_input, '')) = '' then
    raise exception '워크숍 제목을 입력해 주세요.';
  end if;
  if slot_input not in ('morning', 'afternoon') then
    raise exception '세션이 올바르지 않습니다.';
  end if;
  if capacity_input < 0 then
    raise exception '정원은 0 이상의 정수여야 합니다.';
  end if;

  update public.workshops
  set title = trim(title_input),
      slot = slot_input,
      capacity = capacity_input,
      is_open = coalesce(is_open_input, false)
  where id = workshop_id;

  if not found then
    raise exception '워크숍을 찾을 수 없습니다.';
  end if;

  return true;
end;
$$;

drop function if exists public.admin_delete_workshop(uuid);

create or replace function public.admin_delete_workshop(workshop_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.workshops where id = workshop_id;

  if not found then
    raise exception '워크숍을 찾을 수 없습니다.';
  end if;

  return true;
end;
$$;

grant execute on function public.admin_create_workshop(text, text, integer, boolean) to anon, authenticated;
grant execute on function public.admin_update_workshop(uuid, text, text, integer, boolean) to anon, authenticated;
grant execute on function public.admin_delete_workshop(uuid) to anon, authenticated;

update public.workshops
set capacity = 10
where id = '44444444-4444-4444-8444-444444444444';

notify pgrst, 'reload schema';
