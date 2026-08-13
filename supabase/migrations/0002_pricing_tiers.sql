-- Ramesh Rentals: duration-based pricing tiers
-- Run this in the Supabase SQL Editor against the already-deployed project.

alter table vehicles
  add column price_tiers jsonb not null default '[]'::jsonb;

alter table bookings
  add column estimated_total numeric(10, 2);

comment on column vehicles.price_tiers is
  'Array of { min_days: number, price_per_day: number }. A booking of N days uses the highest tier whose min_days <= N, falling back to price_per_day.';
