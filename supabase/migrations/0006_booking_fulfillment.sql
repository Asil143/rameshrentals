-- Let customers choose doorstep delivery or pickup at the rental location.

alter table public.bookings
  add column fulfillment_method text not null default 'location_pickup'
  check (fulfillment_method in ('doorstep_delivery', 'location_pickup'));

create or replace function public.create_booking_request_v2(
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
set search_path = public, pg_temp
as $$
declare
  v_booking_id uuid;
begin
  if p_fulfillment_method not in ('doorstep_delivery', 'location_pickup') then
    raise exception using errcode = '22023', message = 'INVALID_FULFILLMENT_METHOD';
  end if;

  v_booking_id := public.create_booking_request(
    p_vehicle_id, p_customer_name, p_customer_phone,
    p_start, p_end, p_accept_policy
  );

  update public.bookings
  set fulfillment_method = p_fulfillment_method
  where id = v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function public.create_booking_request(uuid, text, text, date, date, boolean)
  from anon, authenticated;
revoke all on function public.create_booking_request_v2(uuid, text, text, date, date, boolean, text)
  from public;
grant execute on function public.create_booking_request_v2(uuid, text, text, date, date, boolean, text)
  to anon, authenticated;
