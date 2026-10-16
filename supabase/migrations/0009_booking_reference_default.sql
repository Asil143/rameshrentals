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
