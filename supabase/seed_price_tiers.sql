-- Ramesh Rentals: demo long-term discount tiers for the seeded Addanki fleet.
-- Optional — run after 0002_pricing_tiers.sql if you want the demo vehicles
-- to show discount pricing immediately.

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 349},
  {"min_days": 10, "price_per_day": 299},
  {"min_days": 15, "price_per_day": 249}
]'::jsonb
where make = 'Honda' and model = 'Activa 6G';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 309},
  {"min_days": 10, "price_per_day": 269},
  {"min_days": 15, "price_per_day": 229}
]'::jsonb
where make = 'TVS' and model = 'Jupiter';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 799},
  {"min_days": 10, "price_per_day": 699}
]'::jsonb
where make = 'Royal Enfield' and model = 'Classic 350';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 1600},
  {"min_days": 10, "price_per_day": 1400}
]'::jsonb
where make = 'Maruti Suzuki' and model = 'Swift';

update vehicles set price_tiers = '[
  {"min_days": 5, "price_per_day": 1450},
  {"min_days": 10, "price_per_day": 1250}
]'::jsonb
where make = 'Hyundai' and model = 'i10';
