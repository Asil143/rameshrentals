-- Every update to a vehicle failed with "permission denied for function
-- valid_price_tiers": 0005 revoked execute on it from PUBLIC, but the
-- vehicles_valid_price_tiers CHECK constraint runs it as the user making the
-- change. It only inspects the price-tier JSON it is given (no table access),
-- so logged-in users (admins edit vehicles through RLS) may execute it.

grant execute on function rameshrentals.valid_price_tiers(jsonb, numeric) to authenticated;
