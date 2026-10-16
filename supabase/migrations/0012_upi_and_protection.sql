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
