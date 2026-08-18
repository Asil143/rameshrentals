-- Ramesh Rentals: add Bajaj Platina 110 to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Bajaj', 'Platina 110', 2024, 'TBD-PLT-01', 300.00,
  array['/vehicles/bajaj-platina-110.webp'],
  'available';
