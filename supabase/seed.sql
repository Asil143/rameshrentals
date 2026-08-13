-- Ramesh Rentals: seed data
-- Run this after 0001_init.sql against your Supabase project's SQL editor.

insert into towns (name, slug, state, active) values
  ('Addanki', 'addanki', 'Andhra Pradesh', true),
  ('Ongole', 'ongole', 'Andhra Pradesh', false),
  ('Markapur', 'markapur', 'Andhra Pradesh', false),
  ('Darsi', 'darsi', 'Andhra Pradesh', false),
  ('Martur', 'martur', 'Andhra Pradesh', false);

insert into owners (name, phone, type, verified) values
  ('Ramesh Rentals', '9999999999', 'platform', true);

-- Demo fleet in Addanki, owned by the platform.
insert into vehicles (owner_id, town_id, type, make, model, year, registration_no, price_per_day, photos, status)
select
  (select id from owners where type = 'platform' limit 1),
  (select id from towns where slug = 'addanki'),
  v.type, v.make, v.model, v.year, v.registration_no, v.price_per_day, '{}', 'available'
from (values
  ('bike', 'Honda', 'Activa 6G', 2023, 'AP16AB1234', 400.00),
  ('bike', 'TVS', 'Jupiter', 2022, 'AP16AB1235', 350.00),
  ('bike', 'Royal Enfield', 'Classic 350', 2023, 'AP16AB1236', 900.00),
  ('car', 'Maruti Suzuki', 'Swift', 2022, 'AP16CD5678', 1800.00),
  ('car', 'Hyundai', 'i10', 2021, 'AP16CD5679', 1600.00)
) as v(type, make, model, year, registration_no, price_per_day);
