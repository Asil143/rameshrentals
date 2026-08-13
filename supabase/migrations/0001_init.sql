-- Ramesh Rentals: initial schema

create extension if not exists "pgcrypto";

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
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security

alter table towns enable row level security;
alter table owners enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- towns: readable by everyone, writable only by admins
create policy "towns are publicly readable" on towns
  for select using (true);
create policy "admins manage towns" on towns
  for all using (public.is_admin()) with check (public.is_admin());

-- owners: not exposed publicly; admins only
create policy "admins manage owners" on owners
  for all using (public.is_admin()) with check (public.is_admin());

-- vehicles: available vehicles are publicly readable; admins manage all
create policy "available vehicles are publicly readable" on vehicles
  for select using (status = 'available' or public.is_admin());
create policy "admins manage vehicles" on vehicles
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings: anyone can submit a booking request (customer_id is set only
-- when the customer is logged in); customers read their own, admins read all
create policy "customers read own bookings" on bookings
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "anyone can create a booking request" on bookings
  for insert with check (customer_id is null or customer_id = auth.uid());
create policy "admins manage bookings" on bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- profiles: users read/update their own; admins read all
create policy "users read own profile" on profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "users update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
