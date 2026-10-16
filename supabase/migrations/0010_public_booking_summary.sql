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
