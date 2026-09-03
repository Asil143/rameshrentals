-- Premium rental operations: timing, transparent fees, richer vehicles,
-- inspections, payment/deposit tracking, and private customer documents.

alter table public.towns
  add column pickup_address text,
  add column maps_url text,
  add column delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  add column collection_fee numeric(10,2) not null default 0 check (collection_fee >= 0),
  add column delivery_radius_km integer not null default 10 check (delivery_radius_km between 0 and 100),
  add column opening_time time not null default '08:00',
  add column closing_time time not null default '20:00';

alter table public.vehicles
  add column fuel_type text check (fuel_type in ('petrol', 'diesel', 'electric', 'cng')),
  add column transmission text check (transmission in ('manual', 'automatic', 'gearless')),
  add column seats integer check (seats between 1 and 12),
  add column included_km_per_day integer check (included_km_per_day > 0),
  add column extra_km_rate numeric(10,2) check (extra_km_rate >= 0),
  add column helmet_count integer not null default 0 check (helmet_count between 0 and 4),
  add column last_inspected_at date,
  add column luggage_capacity text;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
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

update public.bookings
set reference = 'RR-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where reference is null;
alter table public.bookings alter column reference set not null;

alter table public.bookings drop constraint if exists bookings_no_active_overlap;
alter table public.bookings add constraint bookings_no_active_overlap
  exclude using gist (vehicle_id with =, daterange(start_date, end_date, '[]') with &&)
  where (status in ('pending', 'confirmed', 'ready', 'picked_up'));

create table public.booking_inspections (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stage text not null check (stage in ('handover', 'return')),
  odometer_km integer check (odometer_km >= 0),
  fuel_level text check (fuel_level in ('empty', 'quarter', 'half', 'three_quarters', 'full', 'electric')),
  notes text check (char_length(notes) <= 1000),
  photo_paths text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (booking_id, stage)
);

alter table public.booking_inspections enable row level security;
create policy "admins manage inspections" on public.booking_inspections
  for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read own inspections" on public.booking_inspections
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid()
  ));

create or replace function public.create_booking_request_v3(
  p_vehicle_id uuid, p_customer_name text, p_customer_phone text,
  p_start date, p_end date, p_accept_policy boolean,
  p_fulfillment_method text, p_pickup_time time, p_return_time time,
  p_delivery_address text, p_return_method text, p_customer_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
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
  from public.vehicles v join public.towns t on t.id = v.town_id where v.id = p_vehicle_id;
  if p_pickup_time < v_open or p_pickup_time > v_close or p_return_time < v_open or p_return_time > v_close then
    raise exception using errcode = '22023', message = 'OUTSIDE_BUSINESS_HOURS';
  end if;

  v_booking_id := public.create_booking_request_v2(
    p_vehicle_id, p_customer_name, p_customer_phone, p_start, p_end,
    p_accept_policy, p_fulfillment_method
  );

  select case when p_fulfillment_method = 'doorstep_delivery' then t.delivery_fee else 0 end,
         case when p_return_method = 'doorstep_collection' then t.collection_fee else 0 end,
         case when v.type = 'bike' then 1000 else 5000 end
  into v_delivery_fee, v_collection_fee, v_deposit
  from public.vehicles v join public.towns t on t.id = v.town_id
  where v.id = p_vehicle_id;

  update public.bookings
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

revoke all on function public.create_booking_request_v2(uuid, text, text, date, date, boolean, text) from anon, authenticated;
revoke all on function public.create_booking_request_v3(uuid, text, text, date, date, boolean, text, time, time, text, text, text) from public;
grant execute on function public.create_booking_request_v3(uuid, text, text, date, date, boolean, text, time, time, text, text, text) to anon, authenticated;

create or replace function public.customer_cancel_booking(p_booking_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.bookings set status = 'cancelled'
  where id = p_booking_id and customer_id = auth.uid()
    and status in ('pending', 'confirmed')
    and start_date > (now() at time zone 'Asia/Kolkata')::date;
  return found;
end; $$;
revoke all on function public.customer_cancel_booking(uuid) from public;
grant execute on function public.customer_cancel_booking(uuid) to authenticated;

create or replace function public.customer_reschedule_booking(p_booking_id uuid, p_start date, p_end date)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_booking public.bookings%rowtype;
  v_vehicle public.vehicles%rowtype;
  v_days integer;
  v_rate numeric(10,2);
begin
  if p_start < (now() at time zone 'Asia/Kolkata')::date or p_end < p_start or p_end > p_start + 30 then
    raise exception using errcode = '22023', message = 'INVALID_DATE_RANGE';
  end if;
  select * into v_booking from public.bookings
    where id = p_booking_id and customer_id = auth.uid() and status in ('pending', 'confirmed') for update;
  if not found then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_booking.vehicle_id::text, 0));
  select * into v_vehicle from public.vehicles where id = v_booking.vehicle_id;
  v_days := p_end - p_start + 1;
  select coalesce((select (tier->>'price_per_day')::numeric from jsonb_array_elements(v_vehicle.price_tiers) tier
    where (tier->>'min_days')::integer <= v_days order by (tier->>'min_days')::integer desc limit 1), v_vehicle.price_per_day) into v_rate;
  update public.bookings set start_date = p_start, end_date = p_end,
    estimated_total = v_days * v_rate + delivery_fee + collection_fee + extras_total where id = p_booking_id;
  return true;
end; $$;
revoke all on function public.customer_reschedule_booking(uuid, date, date) from public;
grant execute on function public.customer_reschedule_booking(uuid, date, date) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rental-documents', 'rental-documents', false, 5242880, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy "customers upload own booking documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'rental-documents' and exists (
      select 1 from public.bookings b
      where b.id::text = (storage.foldername(name))[1] and b.customer_id = auth.uid()
    )
  );
create policy "customers read own booking documents" on storage.objects
  for select to authenticated using (
    bucket_id = 'rental-documents' and exists (
      select 1 from public.bookings b
      where b.id::text = (storage.foldername(name))[1] and (b.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "admins manage rental documents" on storage.objects
  for all to authenticated using (bucket_id = 'rental-documents' and public.is_admin())
  with check (bucket_id = 'rental-documents' and public.is_admin());

create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  details jsonb not null default '{}',
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.booking_events enable row level security;
create policy "admins read booking events" on public.booking_events for select using (public.is_admin());
create policy "customers read own booking events" on public.booking_events for select using (exists (
  select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid()
));

create or replace function public.log_booking_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_events (booking_id, event_type, details, actor_id)
    values (new.id, 'created', jsonb_build_object('status', new.status), auth.uid());
  elsif old.status is distinct from new.status or old.payment_status is distinct from new.payment_status or old.deposit_status is distinct from new.deposit_status then
    insert into public.booking_events (booking_id, event_type, details, actor_id)
    values (new.id, 'updated', jsonb_build_object('status', new.status, 'payment_status', new.payment_status, 'deposit_status', new.deposit_status), auth.uid());
  end if;
  return new;
end; $$;
create trigger booking_change_audit after insert or update on public.bookings
  for each row execute function public.log_booking_change();
