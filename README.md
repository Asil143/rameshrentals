# Ramesh Rentals

Bike & car rental MVP for Addanki, Ongole, Markapur, Darsi, Martur and beyond. Next.js (App Router) + Tailwind + Supabase, installable as a PWA on mobile.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Copy `.env.local.example` to `.env.local` and fill in those two values:

   ```bash
   cp .env.local.example .env.local
   ```

## 2. Run the database migration

1. Open your Supabase project's **SQL Editor**.
2. Paste and run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates the `towns`, `owners`, `vehicles`, `bookings`, `profiles` tables and their Row Level Security policies.
3. Paste and run [`supabase/migrations/0002_pricing_tiers.sql`](supabase/migrations/0002_pricing_tiers.sql). Adds `vehicles.price_tiers` (duration-based discount rates) and `bookings.estimated_total`.
4. Paste and run [`supabase/seed.sql`](supabase/seed.sql) to add the five towns (Addanki active, the rest marked "coming soon") and a small demo fleet in Addanki.
5. Optionally run [`supabase/seed_price_tiers.sql`](supabase/seed_price_tiers.sql) to give the demo fleet example long-term discount rates.

If you already ran `0001_init.sql` and `seed.sql` on a live project before pricing tiers existed, you only need to run `0002_pricing_tiers.sql` (and optionally `seed_price_tiers.sql`) to catch up — the other two are safe to skip since they'd just error on already-existing tables/rows.

## 3. Enable phone (OTP) login

Supabase Auth needs an SMS provider to send OTP codes — it does not send SMS itself.

1. In your Supabase project, go to **Authentication → Providers → Phone**.
2. Enable it and connect an SMS provider (e.g. **MSG91** or **Twilio**) with your own account/credentials — required for OTPs to actually reach Indian phone numbers.

Without this step, sign-up/login and admin access won't work, but browsing vehicles and submitting a booking request (which doesn't require login) will.

## 4. Make yourself an admin

Log in once via `/login` with your phone number, then in the Supabase SQL Editor run:

```sql
update profiles set is_admin = true where phone = '+91XXXXXXXXXX';
```

You'll then see an **Admin** link in the header to manage vehicles and bookings.

## 5. Set your WhatsApp number

Edit `WHATSAPP_NUMBER` in [`src/lib/constants.ts`](src/lib/constants.ts) to your real WhatsApp Business number (country code + number, no `+` or spaces), e.g. `"919876543210"`.

## 6. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Browsing & booking** — anyone can browse vehicles per town and submit a booking request (name, phone, dates) with no login required. Logging in via phone OTP additionally links future bookings to a `/bookings` history page.
- **No online payment yet** — deposit and rental payment are collected in person at pickup (cash/UPI). Booking requests land as `pending` in `/admin`, where you confirm or cancel them.
- **WhatsApp booking** — every vehicle page and town page also offers a "Book via WhatsApp" button as an equally first-class booking path, since it's often the higher-trust channel in smaller towns.
- **Multi-town ready** — `towns.active` controls whether a town shows live listings or a "coming soon" page. Flip a town to `active = true` in Supabase once you have real vehicles there — no code change needed.
- **Owner-ready data model** — `vehicles.owner_id` already points at an `owners` table with a `platform` vs `individual` type. The MVP only uses the seeded platform owner (your own fleet); opening the platform to local vehicle owners later is a UI addition, not a schema change.
- **Duration-based pricing** — each vehicle has a base `price_per_day` plus optional discount tiers (e.g. 5+/10+/15+ days) set in `/admin` when adding a vehicle. The booking form shows a live estimated total as the customer picks dates, and that estimate is saved on the booking so `/admin` and `/bookings` don't need to recompute it.
- **PWA** — `public/manifest.json` + `public/sw.js` make the site installable to a phone's home screen with an offline app-shell fallback. Icons in `public/icons/` are placeholders — swap them for real branded artwork before launch.

## Deploying

- **Frontend**: push this repo to GitHub and import it on [Vercel](https://vercel.com/new); add the two `NEXT_PUBLIC_SUPABASE_*` env vars from step 1 in the Vercel project settings.
- **Backend**: nothing to deploy — Supabase is already hosted.
- Point `rameshrentals.com` at the Vercel deployment (Vercel's dashboard walks through the DNS records).

## What's intentionally not built yet

- Online payment (Razorpay) — deferred, pay-at-pickup only for now.
- Owner self-service listing UI — data model supports it, UI doesn't exist yet.
- Native mobile apps — the PWA covers mobile for now.
