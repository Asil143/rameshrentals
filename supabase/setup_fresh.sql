-- Ramesh Rentals: full fresh setup in its own `rameshrentals` schema.
-- This Supabase project is shared with other apps (their tables live in
-- `public`), so nothing here touches `public`.
--
-- Generated from migrations/0001–0012 + seed files with `public.` rewritten
-- to `rameshrentals.`. New migrations must target `rameshrentals` too.
--
-- Before running: nothing. After running: add `rameshrentals` under
-- Project Settings → Data API → Exposed schemas.
-- Runs in one transaction: if anything fails, nothing is applied.

begin;

create schema if not exists rameshrentals;

grant usage on schema rameshrentals to anon, authenticated, service_role;
alter default privileges in schema rameshrentals
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema rameshrentals
  grant all on sequences to anon, authenticated, service_role;

-- Unqualified names below are created in / resolved from rameshrentals only.
set local search_path = rameshrentals, extensions;

-- Re-run safety: only objects owned by this app outside its schema.
drop trigger if exists rameshrentals_on_auth_user_created on auth.users;
drop policy if exists "customers upload own booking documents" on storage.objects;
drop policy if exists "customers read own booking documents" on storage.objects;
drop policy if exists "admins manage rental documents" on storage.objects;
drop policy if exists "admins upload vehicle photos" on storage.objects;
drop policy if exists "admins update vehicle photos" on storage.objects;
drop policy if exists "anyone reads vehicle photos" on storage.objects;


-- ============================================================
-- migrations/0001_init.sql
-- ============================================================

-- Ramesh Rentals: initial schema

create extension if not exists "pgcrypto" with schema extensions;

create table towns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  state text not null default 'Andhra Pradesh',
  active boolean not null default false
);

create table owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  type text not null check (type in ('platform', 'individual')),
  verified boolean not null default false
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete restrict,
  town_id uuid not null references towns(id) on delete restrict,
  type text not null check (type in ('bike', 'car')),
  make text not null,
  model text not null,
  year int not null,
  registration_no text not null,
  price_per_day numeric(10, 2) not null,
  photos text[] not null default '{}',
  status text not null default 'available' check (status in ('available', 'booked', 'maintenance')),
  created_at timestamptz not null default now()
);

create index vehicles_town_id_idx on vehicles(town_id);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

create index bookings_vehicle_id_idx on bookings(vehicle_id);
create index bookings_customer_id_idx on bookings(customer_id);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  is_admin boolean not null default false
);

-- Auto-create a profile row whenever a new auth user signs up (phone OTP).
create function rameshrentals.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = rameshrentals
as $$
begin
  insert into rameshrentals.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger rameshrentals_on_auth_user_created
  after insert on auth.users
  for each row execute procedure rameshrentals.handle_new_user();

-- Row Level Security

alter table towns enable row level security;
alter table owners enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table profiles enable row level security;

create function rameshrentals.is_admin()
returns boolean
language sql
security definer set search_path = rameshrentals
stable
as $$
  select coalesce((select is_admin from rameshrentals.profiles where id = auth.uid()), false);
$$;

-- towns: readable by everyone, writable only by admins
create policy "towns are publicly readable" on towns
  for select using (true);
create policy "admins manage towns" on towns
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());

-- owners: not exposed publicly; admins only
create policy "admins manage owners" on owners
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());

-- vehicles: available vehicles are publicly readable; admins manage all
create policy "available vehicles are publicly readable" on vehicles
  for select using (status = 'available' or rameshrentals.is_admin());
create policy "admins manage vehicles" on vehicles
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());

-- bookings: anyone can submit a booking request (customer_id is set only
-- when the customer is logged in); customers read their own, admins read all
create policy "customers read own bookings" on bookings
  for select using (customer_id = auth.uid() or rameshrentals.is_admin());
create policy "anyone can create a booking request" on bookings
  for insert with check (customer_id is null or customer_id = auth.uid());
create policy "admins manage bookings" on bookings
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());

-- profiles: users read/update their own; admins read all
create policy "users read own profile" on profiles
  for select using (id = auth.uid() or rameshrentals.is_admin());
create policy "users update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================
-- migrations/0002_pricing_tiers.sql
-- ============================================================

-- Ramesh Rentals: duration-based pricing tiers
-- Run this in the Supabase SQL Editor against the already-deployed project.

alter table vehicles
  add column price_tiers jsonb not null default '[]'::jsonb;

alter table bookings
  add column estimated_total numeric(10, 2);

comment on column vehicles.price_tiers is
  'Array of { min_days: number, price_per_day: number }. A booking of N days uses the highest tier whose min_days <= N, falling back to price_per_day.';

-- ============================================================
-- migrations/0003_availability_check.sql
-- ============================================================

-- Ramesh Rentals: server-side availability check for booking requests.
--
-- The existing RLS policy on `bookings` only lets a customer read their own
-- bookings (or admins read all) — a plain SELECT from the app can't see
-- other customers' bookings to check for date-range conflicts. This
-- SECURITY DEFINER function returns only a boolean (no booking details
-- leak to the caller) so the app can safely check availability before
-- accepting a new booking request.

create function rameshrentals.vehicle_has_overlap(p_vehicle_id uuid, p_start date, p_end date)
returns boolean
language sql
security definer set search_path = rameshrentals
stable
as $$
  select exists (
    select 1 from bookings
    where vehicle_id = p_vehicle_id
      and status in ('pending', 'confirmed')
      and start_date <= p_end
      and end_date >= p_start
  );
$$;

grant execute on function rameshrentals.vehicle_has_overlap(uuid, date, date) to anon, authenticated;

-- ============================================================
-- migrations/0004_booked_ranges.sql
-- ============================================================

-- Ramesh Rentals: expose a vehicle's booked date ranges (no customer data)
-- so the booking form can grey out unavailable dates before submission.
--
-- Same reasoning as vehicle_has_overlap in 0003_availability_check.sql —
-- the RLS policy on `bookings` only lets a customer read their own
-- bookings, so a plain SELECT can't see other customers' booked ranges.
-- This SECURITY DEFINER function returns only start/end dates, nothing
-- identifying the customer.

create function rameshrentals.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
security definer set search_path = rameshrentals
stable
as $$
  select start_date, end_date from bookings
  where vehicle_id = p_vehicle_id
    and status in ('pending', 'confirmed');
$$;

grant execute on function rameshrentals.vehicle_booked_ranges(uuid) to anon, authenticated;

-- ============================================================
-- migrations/0005_security_hardening.sql
-- ============================================================

-- Lock down privilege escalation and make booking creation atomic.

create extension if not exists btree_gist with schema extensions;

-- Users currently have no profile-editing UI. In particular, they must never
-- be able to change is_admin through the public API.
drop policy if exists "users update own profile" on rameshrentals.profiles;

-- Direct inserts let callers forge status and totals. All booking creation now
-- goes through create_booking_request below.
drop policy if exists "anyone can create a booking request" on rameshrentals.bookings;
revoke insert on rameshrentals.bookings from anon, authenticated;

alter table rameshrentals.vehicles
  add constraint vehicles_price_positive check (price_per_day > 0),
  add constraint vehicles_year_reasonable check (year between 1990 and 2100),
  add constraint vehicles_registration_length check (char_length(trim(registration_no)) between 4 and 20),
  add constraint vehicles_registration_unique unique (registration_no);

create unique index vehicles_registration_normalized_unique
  on rameshrentals.vehicles (upper(regexp_replace(registration_no, '[^A-Za-z0-9]', '', 'g')));

create or replace function rameshrentals.valid_price_tiers(value jsonb, base_price numeric)
returns boolean
language plpgsql
immutable
set search_path = rameshrentals, pg_temp
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

alter table rameshrentals.vehicles
  add constraint vehicles_valid_price_tiers check (rameshrentals.valid_price_tiers(price_tiers, price_per_day));

revoke all on function rameshrentals.valid_price_tiers(jsonb, numeric) from public;

alter table rameshrentals.bookings
  add column privacy_accepted_at timestamptz,
  add constraint bookings_customer_name_length check (char_length(trim(customer_name)) between 2 and 100),
  add constraint bookings_customer_phone_format check (customer_phone ~ '^[0-9]{10}$'),
  add constraint bookings_max_duration check (end_date <= start_date + 30),
  add constraint bookings_total_nonnegative check (estimated_total is null or estimated_total >= 0);

-- The database, rather than an application-level preflight query, is the final
-- authority on overlapping active bookings.
alter table rameshrentals.bookings
  add constraint bookings_no_active_overlap
  exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending', 'confirmed'));

create index if not exists bookings_phone_created_idx
  on rameshrentals.bookings (customer_phone, created_at desc);

create or replace function rameshrentals.create_booking_request(
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
set search_path = rameshrentals, pg_temp
as $$
declare
  v_vehicle rameshrentals.vehicles%rowtype;
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
  from rameshrentals.vehicles
  where id = p_vehicle_id and status = 'available';

  if not found then
    raise exception using errcode = 'P0002', message = 'VEHICLE_UNAVAILABLE';
  end if;

  if exists (
    select 1 from rameshrentals.bookings
    where vehicle_id = p_vehicle_id
      and status in ('pending', 'confirmed')
      and start_date <= p_end
      and end_date >= p_start
  ) then
    raise exception using errcode = '23P01', message = 'DATES_UNAVAILABLE';
  end if;

  -- A practical phone-based throttle. Platform-level IP/CAPTCHA controls can
  -- be layered on top without weakening this database backstop.
  if (select count(*) from rameshrentals.bookings
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

  insert into rameshrentals.bookings (
    vehicle_id, customer_id, customer_name, customer_phone,
    start_date, end_date, estimated_total, status, privacy_accepted_at
  ) values (
    p_vehicle_id, auth.uid(), p_customer_name, p_customer_phone,
    p_start, p_end, v_days * v_rate, 'pending', now()
  ) returning id into v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function rameshrentals.create_booking_request(uuid, text, text, date, date, boolean) from public;
grant execute on function rameshrentals.create_booking_request(uuid, text, text, date, date, boolean)
  to anon, authenticated;

-- SECURITY DEFINER functions should never inherit the default PUBLIC execute
-- privilege. These two intentionally expose only non-customer availability.
revoke all on function rameshrentals.vehicle_has_overlap(uuid, date, date) from public;
grant execute on function rameshrentals.vehicle_has_overlap(uuid, date, date) to anon, authenticated;
revoke all on function rameshrentals.vehicle_booked_ranges(uuid) from public;
grant execute on function rameshrentals.vehicle_booked_ranges(uuid) to anon, authenticated;

create or replace function rameshrentals.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
security definer set search_path = rameshrentals
stable
as $$
  select start_date, end_date from rameshrentals.bookings
  where vehicle_id = p_vehicle_id
    and status in ('pending', 'confirmed')
    and end_date >= (now() at time zone 'Asia/Kolkata')::date
    and start_date <= (now() at time zone 'Asia/Kolkata')::date + 365
  order by start_date;
$$;

revoke all on function rameshrentals.vehicle_booked_ranges(uuid) from public;
grant execute on function rameshrentals.vehicle_booked_ranges(uuid) to anon, authenticated;

-- ============================================================
-- migrations/0006_booking_fulfillment.sql
-- ============================================================

-- Let customers choose doorstep delivery or pickup at the rental location.

alter table rameshrentals.bookings
  add column fulfillment_method text not null default 'location_pickup'
  check (fulfillment_method in ('doorstep_delivery', 'location_pickup'));

create or replace function rameshrentals.create_booking_request_v2(
  p_vehicle_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_start date,
  p_end date,
  p_accept_policy boolean,
  p_fulfillment_method text
)
returns uuid
language plpgsql
security definer
set search_path = rameshrentals, pg_temp
as $$
declare
  v_booking_id uuid;
begin
  if p_fulfillment_method not in ('doorstep_delivery', 'location_pickup') then
    raise exception using errcode = '22023', message = 'INVALID_FULFILLMENT_METHOD';
  end if;

  v_booking_id := rameshrentals.create_booking_request(
    p_vehicle_id, p_customer_name, p_customer_phone,
    p_start, p_end, p_accept_policy
  );

  update rameshrentals.bookings
  set fulfillment_method = p_fulfillment_method
  where id = v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function rameshrentals.create_booking_request(uuid, text, text, date, date, boolean)
  from anon, authenticated;
revoke all on function rameshrentals.create_booking_request_v2(uuid, text, text, date, date, boolean, text)
  from public;
grant execute on function rameshrentals.create_booking_request_v2(uuid, text, text, date, date, boolean, text)
  to anon, authenticated;

-- ============================================================
-- migrations/0007_premium_operations.sql
-- ============================================================

-- Premium rental operations: timing, transparent fees, richer vehicles,
-- inspections, payment/deposit tracking, and private customer documents.

alter table rameshrentals.towns
  add column pickup_address text,
  add column maps_url text,
  add column delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  add column collection_fee numeric(10,2) not null default 0 check (collection_fee >= 0),
  add column delivery_radius_km integer not null default 10 check (delivery_radius_km between 0 and 100),
  add column opening_time time not null default '08:00',
  add column closing_time time not null default '20:00';

alter table rameshrentals.vehicles
  add column fuel_type text check (fuel_type in ('petrol', 'diesel', 'electric', 'cng')),
  add column transmission text check (transmission in ('manual', 'automatic', 'gearless')),
  add column seats integer check (seats between 1 and 12),
  add column included_km_per_day integer check (included_km_per_day > 0),
  add column extra_km_rate numeric(10,2) check (extra_km_rate >= 0),
  add column helmet_count integer not null default 0 check (helmet_count between 0 and 4),
  add column last_inspected_at date,
  add column luggage_capacity text;

alter table rameshrentals.bookings drop constraint if exists bookings_status_check;
alter table rameshrentals.bookings
  add constraint bookings_status_check check (status in ('pending', 'confirmed', 'ready', 'picked_up', 'returned', 'completed', 'cancelled')),
  add column reference text unique,
  add column pickup_time time,
  add column return_time time,
  add column delivery_address text,
  add column return_method text not null default 'location_return' check (return_method in ('location_return', 'doorstep_collection')),
  add column delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  add column collection_fee numeric(10,2) not null default 0 check (collection_fee >= 0),
  add column extras_total numeric(10,2) not null default 0 check (extras_total >= 0),
  add column deposit_amount numeric(10,2) not null default 0 check (deposit_amount >= 0),
  add column payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'part_paid', 'paid', 'refunded')),
  add column deposit_status text not null default 'not_collected' check (deposit_status in ('not_collected', 'held', 'partially_refunded', 'refunded', 'forfeited')),
  add column customer_notes text check (char_length(customer_notes) <= 500);

update rameshrentals.bookings
set reference = 'RR-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where reference is null;
alter table rameshrentals.bookings alter column reference set not null;

alter table rameshrentals.bookings drop constraint if exists bookings_no_active_overlap;
alter table rameshrentals.bookings add constraint bookings_no_active_overlap
  exclude using gist (vehicle_id with =, daterange(start_date, end_date, '[]') with &&)
  where (status in ('pending', 'confirmed', 'ready', 'picked_up'));

create table rameshrentals.booking_inspections (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references rameshrentals.bookings(id) on delete cascade,
  stage text not null check (stage in ('handover', 'return')),
  odometer_km integer check (odometer_km >= 0),
  fuel_level text check (fuel_level in ('empty', 'quarter', 'half', 'three_quarters', 'full', 'electric')),
  notes text check (char_length(notes) <= 1000),
  photo_paths text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (booking_id, stage)
);

alter table rameshrentals.booking_inspections enable row level security;
create policy "admins manage inspections" on rameshrentals.booking_inspections
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());
create policy "customers read own inspections" on rameshrentals.booking_inspections
  for select using (exists (
    select 1 from rameshrentals.bookings b where b.id = booking_id and b.customer_id = auth.uid()
  ));

create or replace function rameshrentals.create_booking_request_v3(
  p_vehicle_id uuid, p_customer_name text, p_customer_phone text,
  p_start date, p_end date, p_accept_policy boolean,
  p_fulfillment_method text, p_pickup_time time, p_return_time time,
  p_delivery_address text, p_return_method text, p_customer_notes text
)
returns uuid
language plpgsql
security definer
set search_path = rameshrentals, pg_temp
as $$
declare
  v_booking_id uuid;
  v_delivery_fee numeric(10,2) := 0;
  v_collection_fee numeric(10,2) := 0;
  v_deposit numeric(10,2);
  v_open time;
  v_close time;
begin
  if p_pickup_time is null or p_return_time is null then
    raise exception using errcode = '22023', message = 'TIME_REQUIRED';
  end if;
  if p_return_method not in ('location_return', 'doorstep_collection') then
    raise exception using errcode = '22023', message = 'INVALID_RETURN_METHOD';
  end if;
  if (p_fulfillment_method = 'doorstep_delivery' or p_return_method = 'doorstep_collection')
     and char_length(trim(coalesce(p_delivery_address, ''))) < 10 then
    raise exception using errcode = '22023', message = 'DELIVERY_ADDRESS_REQUIRED';
  end if;
  if char_length(coalesce(p_customer_notes, '')) > 500 then
    raise exception using errcode = '22023', message = 'NOTES_TOO_LONG';
  end if;

  select t.opening_time, t.closing_time into v_open, v_close
  from rameshrentals.vehicles v join rameshrentals.towns t on t.id = v.town_id where v.id = p_vehicle_id;
  if p_pickup_time < v_open or p_pickup_time > v_close or p_return_time < v_open or p_return_time > v_close then
    raise exception using errcode = '22023', message = 'OUTSIDE_BUSINESS_HOURS';
  end if;

  v_booking_id := rameshrentals.create_booking_request_v2(
    p_vehicle_id, p_customer_name, p_customer_phone, p_start, p_end,
    p_accept_policy, p_fulfillment_method
  );

  select case when p_fulfillment_method = 'doorstep_delivery' then t.delivery_fee else 0 end,
         case when p_return_method = 'doorstep_collection' then t.collection_fee else 0 end,
         case when v.type = 'bike' then 1000 else 5000 end
  into v_delivery_fee, v_collection_fee, v_deposit
  from rameshrentals.vehicles v join rameshrentals.towns t on t.id = v.town_id
  where v.id = p_vehicle_id;

  update rameshrentals.bookings
  set reference = 'RR-' || upper(substr(replace(id::text, '-', ''), 1, 10)),
      pickup_time = p_pickup_time,
      return_time = p_return_time,
      delivery_address = nullif(trim(p_delivery_address), ''),
      return_method = p_return_method,
      delivery_fee = v_delivery_fee,
      collection_fee = v_collection_fee,
      deposit_amount = v_deposit,
      estimated_total = estimated_total + v_delivery_fee + v_collection_fee,
      customer_notes = nullif(trim(p_customer_notes), '')
  where id = v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function rameshrentals.create_booking_request_v2(uuid, text, text, date, date, boolean, text) from anon, authenticated;
revoke all on function rameshrentals.create_booking_request_v3(uuid, text, text, date, date, boolean, text, time, time, text, text, text) from public;
grant execute on function rameshrentals.create_booking_request_v3(uuid, text, text, date, date, boolean, text, time, time, text, text, text) to anon, authenticated;

create or replace function rameshrentals.customer_cancel_booking(p_booking_id uuid)
returns boolean language plpgsql security definer set search_path = rameshrentals, pg_temp as $$
begin
  update rameshrentals.bookings set status = 'cancelled'
  where id = p_booking_id and customer_id = auth.uid()
    and status in ('pending', 'confirmed')
    and start_date > (now() at time zone 'Asia/Kolkata')::date;
  return found;
end; $$;
revoke all on function rameshrentals.customer_cancel_booking(uuid) from public;
grant execute on function rameshrentals.customer_cancel_booking(uuid) to authenticated;

create or replace function rameshrentals.customer_reschedule_booking(p_booking_id uuid, p_start date, p_end date)
returns boolean language plpgsql security definer set search_path = rameshrentals, pg_temp as $$
declare
  v_booking rameshrentals.bookings%rowtype;
  v_vehicle rameshrentals.vehicles%rowtype;
  v_days integer;
  v_rate numeric(10,2);
begin
  if p_start < (now() at time zone 'Asia/Kolkata')::date or p_end < p_start or p_end > p_start + 30 then
    raise exception using errcode = '22023', message = 'INVALID_DATE_RANGE';
  end if;
  select * into v_booking from rameshrentals.bookings
    where id = p_booking_id and customer_id = auth.uid() and status in ('pending', 'confirmed') for update;
  if not found then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_booking.vehicle_id::text, 0));
  select * into v_vehicle from rameshrentals.vehicles where id = v_booking.vehicle_id;
  v_days := p_end - p_start + 1;
  select coalesce((select (tier->>'price_per_day')::numeric from jsonb_array_elements(v_vehicle.price_tiers) tier
    where (tier->>'min_days')::integer <= v_days order by (tier->>'min_days')::integer desc limit 1), v_vehicle.price_per_day) into v_rate;
  update rameshrentals.bookings set start_date = p_start, end_date = p_end,
    estimated_total = v_days * v_rate + delivery_fee + collection_fee + extras_total where id = p_booking_id;
  return true;
end; $$;
revoke all on function rameshrentals.customer_reschedule_booking(uuid, date, date) from public;
grant execute on function rameshrentals.customer_reschedule_booking(uuid, date, date) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rental-documents', 'rental-documents', false, 5242880, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy "customers upload own booking documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'rental-documents' and exists (
      select 1 from rameshrentals.bookings b
      where b.id::text = (storage.foldername(name))[1] and b.customer_id = auth.uid()
    )
  );
create policy "customers read own booking documents" on storage.objects
  for select to authenticated using (
    bucket_id = 'rental-documents' and exists (
      select 1 from rameshrentals.bookings b
      where b.id::text = (storage.foldername(name))[1] and (b.customer_id = auth.uid() or rameshrentals.is_admin())
    )
  );
create policy "admins manage rental documents" on storage.objects
  for all to authenticated using (bucket_id = 'rental-documents' and rameshrentals.is_admin())
  with check (bucket_id = 'rental-documents' and rameshrentals.is_admin());

create table rameshrentals.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references rameshrentals.bookings(id) on delete cascade,
  event_type text not null,
  details jsonb not null default '{}',
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table rameshrentals.booking_events enable row level security;
create policy "admins read booking events" on rameshrentals.booking_events for select using (rameshrentals.is_admin());
create policy "customers read own booking events" on rameshrentals.booking_events for select using (exists (
  select 1 from rameshrentals.bookings b where b.id = booking_id and b.customer_id = auth.uid()
));

create or replace function rameshrentals.log_booking_change()
returns trigger language plpgsql security definer set search_path = rameshrentals, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into rameshrentals.booking_events (booking_id, event_type, details, actor_id)
    values (new.id, 'created', jsonb_build_object('status', new.status), auth.uid());
  elsif old.status is distinct from new.status or old.payment_status is distinct from new.payment_status or old.deposit_status is distinct from new.deposit_status then
    insert into rameshrentals.booking_events (booking_id, event_type, details, actor_id)
    values (new.id, 'updated', jsonb_build_object('status', new.status, 'payment_status', new.payment_status, 'deposit_status', new.deposit_status), auth.uid());
  end if;
  return new;
end; $$;
create trigger booking_change_audit after insert or update on rameshrentals.bookings
  for each row execute function rameshrentals.log_booking_change();

-- ============================================================
-- migrations/0008_growth_upgrades.sql
-- ============================================================

-- Growth upgrades: deposits/payment links, public vehicle photo uploads,
-- maintenance blocks, customer lookup, testimonials, and owner portal support.

alter table rameshrentals.profiles
  add column if not exists owner_id uuid references rameshrentals.owners(id) on delete set null;

alter table rameshrentals.bookings
  add column if not exists advance_amount numeric(10,2) not null default 0 check (advance_amount >= 0),
  add column if not exists payment_link text,
  add column if not exists payment_reference text,
  add column if not exists payment_due_at timestamptz;

create table if not exists rameshrentals.vehicle_maintenance_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references rameshrentals.vehicles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'Maintenance' check (char_length(reason) <= 160),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

alter table rameshrentals.vehicle_maintenance_blocks enable row level security;
create policy "admins manage maintenance blocks" on rameshrentals.vehicle_maintenance_blocks
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());
create policy "owners read own maintenance blocks" on rameshrentals.vehicle_maintenance_blocks
  for select using (exists (
    select 1 from rameshrentals.vehicles v
    join rameshrentals.profiles p on p.owner_id = v.owner_id
    where v.id = vehicle_id and p.id = auth.uid()
  ));

create table if not exists rameshrentals.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  town_id uuid references rameshrentals.towns(id) on delete set null,
  rating integer not null default 5 check (rating between 1 and 5),
  quote text not null check (char_length(quote) between 10 and 400),
  source text not null default 'manual' check (char_length(source) <= 40),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table rameshrentals.testimonials enable row level security;
create policy "anyone reads active testimonials" on rameshrentals.testimonials
  for select using (active = true);
create policy "admins manage testimonials" on rameshrentals.testimonials
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos', 'vehicle-photos', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "admins upload vehicle photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'vehicle-photos' and rameshrentals.is_admin());
create policy "admins update vehicle photos" on storage.objects
  for update to authenticated using (bucket_id = 'vehicle-photos' and rameshrentals.is_admin())
  with check (bucket_id = 'vehicle-photos' and rameshrentals.is_admin());
create policy "anyone reads vehicle photos" on storage.objects
  for select using (bucket_id = 'vehicle-photos');

create or replace function rameshrentals.vehicle_has_overlap(p_vehicle_id uuid, p_start date, p_end date)
returns boolean
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select exists (
    select 1 from rameshrentals.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('pending', 'confirmed', 'ready', 'picked_up')
      and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
  ) or exists (
    select 1 from rameshrentals.vehicle_maintenance_blocks m
    where m.vehicle_id = p_vehicle_id
      and daterange(m.start_date, m.end_date, '[]') && daterange(p_start, p_end, '[]')
  );
$$;

create or replace function rameshrentals.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select b.start_date, b.end_date
  from rameshrentals.bookings b
  where b.vehicle_id = p_vehicle_id
    and b.status in ('pending', 'confirmed', 'ready', 'picked_up')
  union all
  select m.start_date, m.end_date
  from rameshrentals.vehicle_maintenance_blocks m
  where m.vehicle_id = p_vehicle_id;
$$;

-- ============================================================
-- migrations/0009_booking_reference_default.sql
-- ============================================================

-- 0007 made bookings.reference NOT NULL, but create_booking_request inserts
-- the row without one (v3 only sets it in a later UPDATE), so every booking
-- failed. Fill it in on insert from the row's id instead.
--
-- From here on the app lives in the `rameshrentals` schema (see
-- setup_fresh.sql); 0001–0008 above were written against `public`.

create or replace function rameshrentals.set_booking_reference()
returns trigger language plpgsql set search_path = rameshrentals, pg_temp as $$
begin
  new.reference := coalesce(new.reference, 'RR-' || upper(substr(replace(new.id::text, '-', ''), 1, 10)));
  return new;
end; $$;

create trigger booking_reference_default before insert on rameshrentals.bookings
  for each row execute function rameshrentals.set_booking_reference();

-- ============================================================
-- migrations/0010_public_booking_summary.sql
-- ============================================================

-- Guests book without logging in, but RLS only lets a booking's own logged-in
-- customer (or an admin) read it — so the confirmation page 404'd right after
-- booking and /booking-status never found anything.
--
-- This returns a booking's non-personal details (no name, phone, address or
-- notes) to anyone who can prove they hold it: either its unguessable id
-- (from the post-booking redirect) or its reference together with the phone
-- number it was booked with.

create or replace function rameshrentals.public_booking_summary(
  p_booking_id uuid default null,
  p_reference text default null,
  p_phone text default null
)
returns table (
  reference text,
  status text,
  payment_status text,
  start_date date,
  end_date date,
  pickup_time time,
  return_time time,
  fulfillment_method text,
  return_method text,
  estimated_total numeric,
  deposit_amount numeric,
  advance_amount numeric,
  payment_link text,
  vehicle_make text,
  vehicle_model text,
  vehicle_type text,
  town_name text,
  town_slug text
)
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select b.reference, b.status, b.payment_status, b.start_date, b.end_date,
         b.pickup_time, b.return_time, b.fulfillment_method, b.return_method,
         b.estimated_total, b.deposit_amount, b.advance_amount, b.payment_link,
         v.make, v.model, v.type, t.name, t.slug
  from rameshrentals.bookings b
  join rameshrentals.vehicles v on v.id = b.vehicle_id
  join rameshrentals.towns t on t.id = v.town_id
  where (p_booking_id is not null and b.id = p_booking_id)
     or (p_reference is not null and p_phone is not null
         and b.reference = upper(trim(p_reference))
         and b.customer_phone = right(regexp_replace(p_phone, '\D', '', 'g'), 10))
  limit 1;
$$;

revoke all on function rameshrentals.public_booking_summary(uuid, text, text) from public;
grant execute on function rameshrentals.public_booking_summary(uuid, text, text) to anon, authenticated;

-- ============================================================
-- migrations/0011_vehicle_reviews.sql
-- ============================================================

-- Per-vehicle reviews. Only someone holding a returned/completed booking can
-- leave one (via the private /review/<booking id> link the admin sends on
-- WhatsApp), one per booking. Admins can hide reviews.

create table rameshrentals.vehicle_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references rameshrentals.bookings(id) on delete cascade,
  vehicle_id uuid not null references rameshrentals.vehicles(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 600),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index vehicle_reviews_vehicle_idx on rameshrentals.vehicle_reviews (vehicle_id, created_at desc);

alter table rameshrentals.vehicle_reviews enable row level security;
create policy "anyone reads visible reviews" on rameshrentals.vehicle_reviews
  for select using (not hidden or rameshrentals.is_admin());
create policy "admins manage reviews" on rameshrentals.vehicle_reviews
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());
-- No insert policy: customers can only add reviews through submit_vehicle_review.

-- Average rating and review count per vehicle (visible reviews only).
create view rameshrentals.vehicle_rating_summary
with (security_invoker = true) as
  select vehicle_id, round(avg(rating)::numeric, 1) as average, count(*)::integer as review_count
  from rameshrentals.vehicle_reviews
  where not hidden
  group by vehicle_id;

grant select on rameshrentals.vehicle_rating_summary to anon, authenticated;

-- What the review page needs to know about a booking, without personal details.
create or replace function rameshrentals.review_booking_info(p_booking_id uuid)
returns table (vehicle_make text, vehicle_model text, eligible boolean, already_reviewed boolean)
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select v.make, v.model,
         b.status in ('returned', 'completed'),
         exists (select 1 from rameshrentals.vehicle_reviews r where r.booking_id = b.id)
  from rameshrentals.bookings b
  join rameshrentals.vehicles v on v.id = b.vehicle_id
  where b.id = p_booking_id;
$$;

-- Leave a review for a returned/completed booking. Returns false if the
-- booking isn't eligible or already has a review. Only the customer's first
-- name is published.
create or replace function rameshrentals.submit_vehicle_review(p_booking_id uuid, p_rating integer, p_comment text)
returns boolean
language plpgsql
security definer
set search_path = rameshrentals, pg_temp
as $$
declare
  v_booking rameshrentals.bookings%rowtype;
begin
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception using errcode = '22023', message = 'INVALID_RATING';
  end if;
  if char_length(coalesce(p_comment, '')) > 600 then
    raise exception using errcode = '22023', message = 'COMMENT_TOO_LONG';
  end if;

  select * into v_booking from rameshrentals.bookings
  where id = p_booking_id and status in ('returned', 'completed');
  if not found then
    return false;
  end if;

  insert into rameshrentals.vehicle_reviews (booking_id, vehicle_id, reviewer_name, rating, comment)
  values (v_booking.id, v_booking.vehicle_id, split_part(trim(v_booking.customer_name), ' ', 1), p_rating, nullif(trim(p_comment), ''))
  on conflict (booking_id) do nothing;
  return found;
end;
$$;

revoke all on function rameshrentals.review_booking_info(uuid) from public;
grant execute on function rameshrentals.review_booking_info(uuid) to anon, authenticated;
revoke all on function rameshrentals.submit_vehicle_review(uuid, integer, text) from public;
grant execute on function rameshrentals.submit_vehicle_review(uuid, integer, text) to anon, authenticated;

-- ============================================================
-- migrations/0012_upi_and_protection.sql
-- ============================================================

-- UPI advance payments and optional damage protection.
--
-- UPI: each town stores the UPI ID (VPA) customers pay an advance to; the
-- booking page shows a QR / "open UPI app" link for the advance the admin set.
--
-- Protection: an optional per-day add-on. It is only offered once the admin
-- has set a fee for the vehicle type AND written the cover terms for the town.

alter table rameshrentals.towns
  add column upi_id text check (upi_id is null or upi_id ~ '^[A-Za-z0-9._-]{2,255}@[A-Za-z][A-Za-z0-9.-]{1,63}$'),
  add column upi_payee_name text check (char_length(upi_payee_name) <= 80),
  add column protection_fee_bike numeric(10, 2) not null default 0 check (protection_fee_bike >= 0),
  add column protection_fee_car numeric(10, 2) not null default 0 check (protection_fee_car >= 0),
  add column protection_terms text check (char_length(protection_terms) <= 600);

alter table rameshrentals.bookings
  add column protection_selected boolean not null default false,
  add column protection_fee numeric(10, 2) not null default 0 check (protection_fee >= 0);

-- v3 plus the protection choice, priced here from the town's settings so the
-- client can't set its own fee.
create or replace function rameshrentals.create_booking_request_v4(
  p_vehicle_id uuid, p_customer_name text, p_customer_phone text,
  p_start date, p_end date, p_accept_policy boolean,
  p_fulfillment_method text, p_pickup_time time, p_return_time time,
  p_delivery_address text, p_return_method text, p_customer_notes text,
  p_protection boolean
)
returns uuid
language plpgsql
security definer
set search_path = rameshrentals, pg_temp
as $$
declare
  v_booking_id uuid;
  v_fee numeric(10, 2) := 0;
begin
  v_booking_id := rameshrentals.create_booking_request_v3(
    p_vehicle_id, p_customer_name, p_customer_phone, p_start, p_end, p_accept_policy,
    p_fulfillment_method, p_pickup_time, p_return_time, p_delivery_address, p_return_method, p_customer_notes
  );

  if p_protection then
    select (p_end - p_start + 1) * case when v.type = 'bike' then t.protection_fee_bike else t.protection_fee_car end
    into v_fee
    from rameshrentals.vehicles v
    join rameshrentals.towns t on t.id = v.town_id
    where v.id = p_vehicle_id and char_length(trim(coalesce(t.protection_terms, ''))) > 0;

    if coalesce(v_fee, 0) > 0 then
      update rameshrentals.bookings
      set protection_selected = true,
          protection_fee = v_fee,
          estimated_total = estimated_total + v_fee
      where id = v_booking_id;
    end if;
  end if;

  return v_booking_id;
end;
$$;

revoke all on function rameshrentals.create_booking_request_v3(uuid, text, text, date, date, boolean, text, time, time, text, text, text) from anon, authenticated;
revoke all on function rameshrentals.create_booking_request_v4(uuid, text, text, date, date, boolean, text, time, time, text, text, text, boolean) from public;
grant execute on function rameshrentals.create_booking_request_v4(uuid, text, text, date, date, boolean, text, time, time, text, text, text, boolean) to anon, authenticated;

-- Guests' booking summary also reports the protection add-on.
drop function if exists rameshrentals.public_booking_summary(uuid, text, text);
create function rameshrentals.public_booking_summary(
  p_booking_id uuid default null,
  p_reference text default null,
  p_phone text default null
)
returns table (
  reference text,
  status text,
  payment_status text,
  start_date date,
  end_date date,
  pickup_time time,
  return_time time,
  fulfillment_method text,
  return_method text,
  estimated_total numeric,
  deposit_amount numeric,
  advance_amount numeric,
  payment_link text,
  protection_fee numeric,
  vehicle_make text,
  vehicle_model text,
  vehicle_type text,
  town_name text,
  town_slug text
)
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select b.reference, b.status, b.payment_status, b.start_date, b.end_date,
         b.pickup_time, b.return_time, b.fulfillment_method, b.return_method,
         b.estimated_total, b.deposit_amount, b.advance_amount, b.payment_link,
         b.protection_fee, v.make, v.model, v.type, t.name, t.slug
  from rameshrentals.bookings b
  join rameshrentals.vehicles v on v.id = b.vehicle_id
  join rameshrentals.towns t on t.id = v.town_id
  where (p_booking_id is not null and b.id = p_booking_id)
     or (p_reference is not null and p_phone is not null
         and b.reference = upper(trim(p_reference))
         and b.customer_phone = right(regexp_replace(p_phone, '\D', '', 'g'), 10))
  limit 1;
$$;

revoke all on function rameshrentals.public_booking_summary(uuid, text, text) from public;
grant execute on function rameshrentals.public_booking_summary(uuid, text, text) to anon, authenticated;

-- ============================================================
-- seed.sql
-- ============================================================

-- Ramesh Rentals: seed data
-- Run this after 0001_init.sql against your Supabase project's SQL editor.

insert into towns (name, slug, state, active) values
  ('Addanki', 'addanki', 'Andhra Pradesh', true),
  ('Ongole', 'ongole', 'Andhra Pradesh', false),
  ('Markapur', 'markapur', 'Andhra Pradesh', false),
  ('Darsi', 'darsi', 'Andhra Pradesh', false),
  ('Martur', 'martur', 'Andhra Pradesh', false);

insert into owners (name, phone, type, verified) values
  ('Ramesh Rentals', '9999999999', 'platform', true);

-- Demo fleet in Addanki, owned by the platform.
insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  v.type, v.make, v.model, v.year, v.registration_no, v.price_per_day, '{}', 'available'
from (values
  ('bike', 'Honda', 'Activa 6G', 2023, 'AP16AB1234', 400.00),
  ('bike', 'TVS', 'Jupiter', 2022, 'AP16AB1235', 350.00),
  ('bike', 'Royal Enfield', 'Classic 350', 2023, 'AP16AB1236', 900.00),
  ('car', 'Maruti Suzuki', 'Swift', 2022, 'AP16CD5678', 1800.00),
  ('car', 'Hyundai', 'i10', 2021, 'AP16CD5679', 1600.00)
) as v(type, make, model, year, registration_no, price_per_day);

-- ============================================================
-- seed_price_tiers.sql
-- ============================================================

-- Ramesh Rentals: demo long-term discount tiers for the seeded Addanki fleet.
-- Optional — run after 0002_pricing_tiers.sql if you want the demo vehicles
-- to show discount pricing immediately.

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 349},
  {"min_days": 10, "price_per_day": 299},
  {"min_days": 15, "price_per_day": 249}
]'::jsonb
where make = 'Honda' and model = 'Activa 6G';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 309},
  {"min_days": 10, "price_per_day": 269},
  {"min_days": 15, "price_per_day": 229}
]'::jsonb
where make = 'TVS' and model = 'Jupiter';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 799},
  {"min_days": 10, "price_per_day": 699}
]'::jsonb
where make = 'Royal Enfield' and model = 'Classic 350';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 1600},
  {"min_days": 10, "price_per_day": 1400}
]'::jsonb
where make = 'Maruti Suzuki' and model = 'Swift';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 1450},
  {"min_days": 10, "price_per_day": 1250}
]'::jsonb
where make = 'Hyundai' and model = 'i10';

-- ============================================================
-- update_remaining_photos.sql
-- ============================================================

-- Ramesh Rentals: add real photos to the remaining demo vehicles that
-- still show emoji placeholders.

update vehicles set photos = array[
  '/vehicles/honda-activa-6g-side.webp',
  '/vehicles/honda-activa-6g-angle.webp'
] where make = 'Honda' and model = 'Activa 6G';

update vehicles set photos = array[
  '/vehicles/tvs-jupiter-side.webp'
] where make = 'TVS' and model = 'Jupiter';

update vehicles set photos = array[
  '/vehicles/royal-enfield-classic-350-side.webp'
] where make = 'Royal Enfield' and model = 'Classic 350';

update vehicles set photos = array[
  '/vehicles/maruti-suzuki-swift-angle.webp'
] where make = 'Maruti Suzuki' and model = 'Swift';

update vehicles set photos = array[
  '/vehicles/hyundai-i10-angle.jpg'
] where make = 'Hyundai' and model = 'i10';

-- ============================================================
-- add_ertiga.sql
-- ============================================================

-- Ramesh Rentals: add Maruti Suzuki Ertiga to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'car', 'Maruti Suzuki', 'Ertiga', 2024, 'TBD-ERT-01', 2000.00,
  array['/vehicles/maruti-suzuki-ertiga.webp'],
  'available';

-- ============================================================
-- add_hf_deluxe.sql
-- ============================================================

-- Ramesh Rentals: add Hero HF Deluxe (real photo) to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'HF Deluxe', 2024, 'TBD-HFD-01', 300.00,
  array['/vehicles/hero-hf-deluxe.avif'],
  'available';

-- ============================================================
-- add_platina.sql
-- ============================================================

-- Ramesh Rentals: add Bajaj Platina 110 to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Bajaj', 'Platina 110', 2024, 'TBD-PLT-01', 300.00,
  array['/vehicles/bajaj-platina-110.webp'],
  'available';

-- ============================================================
-- add_splendor_passion.sql
-- ============================================================

-- Ramesh Rentals: add Hero Splendor+ (2 photos) and Hero Passion+ to the
-- Addanki fleet. Registration numbers are placeholders — update them via
-- /admin once the vehicles are actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'Splendor+', 2024, 'TBD-SPL-01', 350.00,
  array['/vehicles/hero-splendor-plus-side.webp', '/vehicles/hero-splendor-plus-angle.webp'],
  'available';

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'Passion+', 2024, 'TBD-PSN-01', 350.00,
  array['/vehicles/hero-passion-plus.jpg'],
  'available';

commit;
