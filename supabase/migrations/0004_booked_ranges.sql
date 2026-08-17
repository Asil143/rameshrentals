-- Ramesh Rentals: expose a vehicle's booked date ranges (no customer data)
-- so the booking form can grey out unavailable dates before submission.
--
-- Same reasoning as vehicle_has_overlap in 0003_availability_check.sql —
-- the RLS policy on `bookings` only lets a customer read their own
-- bookings, so a plain SELECT can't see other customers' booked ranges.
-- This SECURITY DEFINER function returns only start/end dates, nothing
-- identifying the customer.

create function public.vehicle_booked_ranges(p_vehicle_id uuid)
returns table(start_date date, end_date date)
language sql
security definer set search_path = public
stable
as $$
  select start_date, end_date from bookings
  where vehicle_id = p_vehicle_id
    and status in ('pending', 'confirmed');
$$;

grant execute on function public.vehicle_booked_ranges(uuid) to anon, authenticated;
