-- Per-vehicle reviews. Only someone holding a returned/completed booking can
-- leave one (via the private /review/<booking id> link the admin sends on
-- WhatsApp), one per booking. Admins can hide reviews.

create table rameshrentals.vehicle_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references rameshrentals.bookings(id) on delete cascade,
  vehicle_id uuid not null references rameshrentals.vehicles(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 600),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index vehicle_reviews_vehicle_idx on rameshrentals.vehicle_reviews (vehicle_id, created_at desc);

alter table rameshrentals.vehicle_reviews enable row level security;
create policy "anyone reads visible reviews" on rameshrentals.vehicle_reviews
  for select using (not hidden or rameshrentals.is_admin());
create policy "admins manage reviews" on rameshrentals.vehicle_reviews
  for all using (rameshrentals.is_admin()) with check (rameshrentals.is_admin());
-- No insert policy: customers can only add reviews through submit_vehicle_review.

-- Average rating and review count per vehicle (visible reviews only).
create view rameshrentals.vehicle_rating_summary
with (security_invoker = true) as
  select vehicle_id, round(avg(rating)::numeric, 1) as average, count(*)::integer as review_count
  from rameshrentals.vehicle_reviews
  where not hidden
  group by vehicle_id;

grant select on rameshrentals.vehicle_rating_summary to anon, authenticated;

-- What the review page needs to know about a booking, without personal details.
create or replace function rameshrentals.review_booking_info(p_booking_id uuid)
returns table (vehicle_make text, vehicle_model text, eligible boolean, already_reviewed boolean)
language sql
stable
security definer
set search_path = rameshrentals, pg_temp
as $$
  select v.make, v.model,
         b.status in ('returned', 'completed'),
         exists (select 1 from rameshrentals.vehicle_reviews r where r.booking_id = b.id)
  from rameshrentals.bookings b
  join rameshrentals.vehicles v on v.id = b.vehicle_id
  where b.id = p_booking_id;
$$;

-- Leave a review for a returned/completed booking. Returns false if the
-- booking isn't eligible or already has a review. Only the customer's first
-- name is published.
create or replace function rameshrentals.submit_vehicle_review(p_booking_id uuid, p_rating integer, p_comment text)
returns boolean
language plpgsql
security definer
set search_path = rameshrentals, pg_temp
as $$
declare
  v_booking rameshrentals.bookings%rowtype;
begin
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception using errcode = '22023', message = 'INVALID_RATING';
  end if;
  if char_length(coalesce(p_comment, '')) > 600 then
    raise exception using errcode = '22023', message = 'COMMENT_TOO_LONG';
  end if;

  select * into v_booking from rameshrentals.bookings
  where id = p_booking_id and status in ('returned', 'completed');
  if not found then
    return false;
  end if;

  insert into rameshrentals.vehicle_reviews (booking_id, vehicle_id, reviewer_name, rating, comment)
  values (v_booking.id, v_booking.vehicle_id, split_part(trim(v_booking.customer_name), ' ', 1), p_rating, nullif(trim(p_comment), ''))
  on conflict (booking_id) do nothing;
  return found;
end;
$$;

revoke all on function rameshrentals.review_booking_info(uuid) from public;
grant execute on function rameshrentals.review_booking_info(uuid) to anon, authenticated;
revoke all on function rameshrentals.submit_vehicle_review(uuid, integer, text) from public;
grant execute on function rameshrentals.submit_vehicle_review(uuid, integer, text) to anon, authenticated;
