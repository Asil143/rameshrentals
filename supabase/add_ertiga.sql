-- Ramesh Rentals: add Maruti Suzuki Ertiga to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'car', 'Maruti Suzuki', 'Ertiga', 2024, 'TBD-ERT-01', 2000.00,
  array['/vehicles/maruti-suzuki-ertiga.webp'],
  'available';
