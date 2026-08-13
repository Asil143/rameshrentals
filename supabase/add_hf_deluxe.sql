-- Ramesh Rentals: add Hero HF Deluxe (real photo) to the Addanki fleet.
-- Registration number is a placeholder — update it via /admin once the
-- vehicle is actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'HF Deluxe', 2024, 'TBD-HFD-01', 300.00,
  array['/vehicles/hero-hf-deluxe.avif'],
  'available';
