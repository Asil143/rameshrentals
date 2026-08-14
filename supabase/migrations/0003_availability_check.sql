-- Ramesh Rentals: server-side availability check for booking requests.
--
-- The existing RLS policy on `bookings` only lets a customer read their own
-- bookings (or admins read all) — a plain SELECT from the app can't see
-- other customers' bookings to check for date-range conflicts. This
-- SECURITY DEFINER function returns only a boolean (no booking details
-- leak to the caller) so the app can safely check availability before
-- accepting a new booking request.

create function public.vehicle_has_overlap(p_vehicle_id uuid, p_start date, p_end date)
returns boolean
language sql
security definer set search_path = public
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

grant execute on function public.vehicle_has_overlap(uuid, date, date) to anon, authenticated;
