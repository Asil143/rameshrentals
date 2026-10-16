-- Growth upgrades: deposits/payment links, public vehicle photo uploads,
-- maintenance blocks, customer lookup, testimonials, and owner portal support.

alter table public.profiles
  add column if not exists owner_id uuid references public.owners(id) on delete set null;

alter table public.bookings
  add column if not exists advance_amount numeric(10,2) not null default 0 check (advance_amount >= 0),
  add column if not exists payment_link text,
  add column if not exists payment_reference text,
  add column if not exists payment_due_at timestamptz;

create table if not exists public.vehicle_maintenance_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'Maintenance' check (char_length(reason) <= 160),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

alter table public.vehicle_maintenance_blocks enable row level security;
create policy "admins manage maintenance blocks" on public.vehicle_maintenance_blocks
  for all using (public.is_admin()) with check (public.is_admin());
create policy "owners read own maintenance blocks" on public.vehicle_maintenance_blocks
  for select using (exists (
    select 1 from public.vehicles v
    join public.profiles p on p.owner_id = v.owner_id
    where v.id = vehicle_id and p.id = auth.uid()
  ));

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  town_id uuid references public.towns(id) on delete set null,
  rating integer not null default 5 check (rating between 1 and 5),
  quote text not null check (char_length(quote) between 10 and 400),
  source text not null default 'manual' check (char_length(source) <= 40),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
create policy "anyone reads active testimonials" on public.testimonials
  for select using (active = true);
create policy "admins manage testimonials" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos', 'vehicle-photos', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "admins upload vehicle photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'vehicle-photos' and public.is_admin());
create policy "admins update vehicle photos" on storage.objects
  for update to authenticated using (bucket_id = 'vehicle-photos' and public.is_admin())
  with check (bucket_id = 'vehicle-photos' and public.is_admin());
create policy "anyone reads vehicle photos" on storage.objects
  for select using (bucket_id = 'vehicle-photos');

create or replace function public.vehicle_has_overlap(p_vehicle_id uuid, p_start date, p_end date)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('pending', 'confirmed', 'ready', 'picked_up')
      and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
  ) or exists (
    select 1 from public.vehicle_maintenance_blocks m
    where m.vehicle_id = p_vehicle_id
      and daterange(m.start_date, m.end_date, '[]') && daterange(p_start, p_end, '[]')
  );
$$;

create or replace function public.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select b.start_date, b.end_date
  from public.bookings b
  where b.vehicle_id = p_vehicle_id
    and b.status in ('pending', 'confirmed', 'ready', 'picked_up')
  union all
  select m.start_date, m.end_date
  from public.vehicle_maintenance_blocks m
  where m.vehicle_id = p_vehicle_id;
$$;
