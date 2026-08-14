-- Ramesh Rentals: add Hero Splendor+ (2 photos) and Hero Passion+ to the
-- Addanki fleet. Registration numbers are placeholders — update them via
-- /admin once the vehicles are actually registered/acquired.

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'Splendor+', 2024, 'TBD-SPL-01', 350.00,
  array['/vehicles/hero-splendor-plus-side.webp', '/vehicles/hero-splendor-plus-angle.webp'],
  'available';

insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  'bike', 'Hero', 'Passion+', 2024, 'TBD-PSN-01', 350.00,
  array['/vehicles/hero-passion-plus.jpg'],
  'available';
