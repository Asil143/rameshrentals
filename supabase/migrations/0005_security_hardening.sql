-- Lock down privilege escalation and make booking creation atomic.

create extension if not exists btree_gist;

-- Users currently have no profile-editing UI. In particular, they must never
-- be able to change is_admin through the public API.
drop policy if exists "users update own profile" on public.profiles;

-- Direct inserts let callers forge status and totals. All booking creation now
-- goes through create_booking_request below.
drop policy if exists "anyone can create a booking request" on public.bookings;
revoke insert on public.bookings from anon, authenticated;

alter table public.vehicles
  add constraint vehicles_price_positive check (price_per_day > 0),
  add constraint vehicles_year_reasonable check (year between 1990 and 2100),
  add constraint vehicles_registration_length check (char_length(trim(registration_no)) between 4 and 20),
  add constraint vehicles_registration_unique unique (registration_no);

create unique index vehicles_registration_normalized_unique
  on public.vehicles (upper(regexp_replace(registration_no, '[^A-Za-z0-9]', '', 'g')));

create or replace function public.valid_price_tiers(value jsonb, base_price numeric)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  tier jsonb;
  last_min integer := 0;
  last_price numeric := base_price;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 10 then return false; end if;
  for tier in
    select item from jsonb_array_elements(value) as items(item)
    order by (item->>'min_days')::integer
  loop
    if jsonb_typeof(tier->'min_days') <> 'number'
       or jsonb_typeof(tier->'price_per_day') <> 'number'
       or (tier->>'min_days')::integer <= last_min
       or (tier->>'price_per_day')::numeric <= 0
       or (tier->>'price_per_day')::numeric >= last_price then
      return false;
    end if;
    last_min := (tier->>'min_days')::integer;
    last_price := (tier->>'price_per_day')::numeric;
  end loop;
  return true;
exception when others then
  return false;
end;
$$;

alter table public.vehicles
  add constraint vehicles_valid_price_tiers check (public.valid_price_tiers(price_tiers, price_per_day));

revoke all on function public.valid_price_tiers(jsonb, numeric) from public;

alter table public.bookings
  add column privacy_accepted_at timestamptz,
  add constraint bookings_customer_name_length check (char_length(trim(customer_name)) between 2 and 100),
  add constraint bookings_customer_phone_format check (customer_phone ~ '^[0-9]{10}$'),
  add constraint bookings_max_duration check (end_date <= start_date + 30),
  add constraint bookings_total_nonnegative check (estimated_total is null or estimated_total >= 0);

-- The database, rather than an application-level preflight query, is the final
-- authority on overlapping active bookings.
alter table public.bookings
  add constraint bookings_no_active_overlap
  exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending', 'confirmed'));

create index if not exists bookings_phone_created_idx
  on public.bookings (customer_phone, created_at desc);

create or replace function public.create_booking_request(
  p_vehicle_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_start date,
  p_end date,
  p_accept_policy boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_vehicle public.vehicles%rowtype;
  v_days integer;
  v_rate numeric(10, 2);
  v_booking_id uuid;
begin
  p_customer_name := trim(p_customer_name);
  p_customer_phone := trim(p_customer_phone);

  if p_accept_policy is not true then
    raise exception using errcode = '22023', message = 'POLICY_NOT_ACCEPTED';
  end if;

  if char_length(p_customer_name) not between 2 and 100 then
    raise exception using errcode = '22023', message = 'INVALID_NAME';
  end if;
  if p_customer_phone !~ '^[0-9]{10}$' then
    raise exception using errcode = '22023', message = 'INVALID_PHONE';
  end if;
  if p_start < (now() at time zone 'Asia/Kolkata')::date then
    raise exception using errcode = '22023', message = 'PAST_START_DATE';
  end if;
  if p_end < p_start or p_end > p_start + 30 then
    raise exception using errcode = '22023', message = 'INVALID_DATE_RANGE';
  end if;

  -- Serialize requests for one vehicle before checking and inserting.
  perform pg_advisory_xact_lock(hashtextextended(p_vehicle_id::text, 0));

  select * into v_vehicle
  from public.vehicles
  where id = p_vehicle_id and status = 'available';

  if not found then
    raise exception using errcode = 'P0002', message = 'VEHICLE_UNAVAILABLE';
  end if;

  if exists (
    select 1 from public.bookings
    where vehicle_id = p_vehicle_id
      and status in ('pending', 'confirmed')
      and start_date <= p_end
      and end_date >= p_start
  ) then
    raise exception using errcode = '23P01', message = 'DATES_UNAVAILABLE';
  end if;

  -- A practical phone-based throttle. Platform-level IP/CAPTCHA controls can
  -- be layered on top without weakening this database backstop.
  if (select count(*) from public.bookings
      where customer_phone = p_customer_phone
        and created_at > now() - interval '15 minutes') >= 3
  then
    raise exception using errcode = 'P0001', message = 'RATE_LIMITED';
  end if;

  v_days := p_end - p_start + 1;
  select coalesce(
    (
      select (tier->>'price_per_day')::numeric
      from jsonb_array_elements(v_vehicle.price_tiers) tier
      where (tier->>'min_days')::integer <= v_days
      order by (tier->>'min_days')::integer desc
      limit 1
    ),
    v_vehicle.price_per_day
  ) into v_rate;

  insert into public.bookings (
    vehicle_id, customer_id, customer_name, customer_phone,
    start_date, end_date, estimated_total, status, privacy_accepted_at
  ) values (
    p_vehicle_id, auth.uid(), p_customer_name, p_customer_phone,
    p_start, p_end, v_days * v_rate, 'pending', now()
  ) returning id into v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function public.create_booking_request(uuid, text, text, date, date, boolean) from public;
grant execute on function public.create_booking_request(uuid, text, text, date, date, boolean)
  to anon, authenticated;

-- SECURITY DEFINER functions should never inherit the default PUBLIC execute
-- privilege. These two intentionally expose only non-customer availability.
revoke all on function public.vehicle_has_overlap(uuid, date, date) from public;
grant execute on function public.vehicle_has_overlap(uuid, date, date) to anon, authenticated;
revoke all on function public.vehicle_booked_ranges(uuid) from public;
grant execute on function public.vehicle_booked_ranges(uuid) to anon, authenticated;

create or replace function public.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
security definer set search_path = public
stable
as $$
  select start_date, end_date from public.bookings
  where vehicle_id = p_vehicle_id
    and status in ('pending', 'confirmed')
    and end_date >= (now() at time zone 'Asia/Kolkata')::date
    and start_date <= (now() at time zone 'Asia/Kolkata')::date + 365
  order by start_date;
$$;

revoke all on function public.vehicle_booked_ranges(uuid) from public;
grant execute on function public.vehicle_booked_ranges(uuid) to anon, authenticated;
