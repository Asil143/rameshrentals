import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TownSelector } from "@/components/town-selector";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleTypeToggle } from "@/components/vehicle-type-toggle";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getAllTowns, getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { SITE_NAME } from "@/lib/constants";
import type { VehicleType } from "@/types/database";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: townSlug } = await params;
  const town = await getTownBySlug(townSlug);
  const townName = town?.name ?? townSlug;

  return {
    title: `Bike & Car Rentals in ${townName} | ${SITE_NAME}`,
    description: `Rent bikes and cars in ${townName} — doorstep delivery or location pickup, pay at handover, book online or on WhatsApp.`,
    alternates: { canonical: `/${townSlug}/vehicles` },
  };
}

export default async function VehiclesPage({
  params,
  searchParams,
}: {
  params: Promise<{ town: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { town: townSlug } = await params;
  const search = await searchParams;

  const [town, towns] = await Promise.all([getTownBySlug(townSlug), getAllTowns()]);
  if (!town) {
    notFound();
  }

  const vehicleType = search.type === "bike" || search.type === "car" ? (search.type as VehicleType) : undefined;

  const locale = await getLocale();
  const t = getDictionary(locale).listing;

  if (!town.active) {
    return (
      <div className="mesh-hero flex flex-1 items-center justify-center px-4 py-24 text-white">
        <div className="mx-auto max-w-lg text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            {t.comingSoon}
          </span>
          <h1 className="font-display mb-3 text-3xl font-bold">{town.name}</h1>
          <p className="mb-7 text-white/75">{t.comingSoonBody(town.name)}</p>
          <div className="flex justify-center">
            <WhatsAppButton
              href={whatsappGeneralLink(town.name, locale)}
              label={t.notifyMe(town.name)}
              className="shadow-lift"
            />
          </div>
        </div>
      </div>
    );
  }

  const vehicles = await getVehiclesForTown(town.id, {
    type: vehicleType,
    q: search.q,
    minPrice: Number(search.min_price) || undefined,
    maxPrice: Number(search.max_price) || undefined,
    seats: Number(search.seats) || undefined,
    fuel: search.fuel || undefined,
    transmission: search.transmission || undefined,
    startDate: search.start_date,
    endDate: search.end_date,
    sort: search.sort === "price_desc" || search.sort === "newest" ? search.sort : "price_asc",
  });

  const moreFilterCount = [search.max_price, search.seats, search.fuel, search.transmission, search.sort && search.sort !== "price_asc" ? search.sort : ""]
    .filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {t.available(vehicles.length)}
          </p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t.vehiclesIn(town.name)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <TownSelector currentSlug={townSlug} towns={towns} />
        </div>
      </div>

      <div className="mb-8">
        <VehicleTypeToggle townSlug={townSlug} current={vehicleType ?? "all"} locale={locale} />
      </div>

      <Form action={`/${townSlug}/vehicles`} className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft lg:grid-cols-6">
        {vehicleType && <input type="hidden" name="type" value={vehicleType} />}
        <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          Search
          <input name="q" defaultValue={search.q} placeholder="Swift, Activa, Ertiga..." className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          From
          <input name="start_date" type="date" defaultValue={search.start_date} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          To
          <input name="end_date" type="date" defaultValue={search.end_date} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <div className="col-span-2 flex items-end gap-2 max-lg:order-last">
          <button className="flex-1 rounded-xl bg-[var(--color-brand-800)] px-4 py-2.5 text-sm font-semibold text-white lg:flex-none lg:py-2">Filter</button>
          <Link href={`/${townSlug}/vehicles${vehicleType ? `?type=${vehicleType}` : ""}`} className="rounded-xl border border-hairline px-4 py-2.5 text-sm font-semibold lg:py-2">Reset</Link>
        </div>
        <details open={moreFilterCount > 0} className="group col-span-2 lg:col-span-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)] [&::-webkit-details-marker]:hidden">
            <span className="transition-transform group-open:rotate-90" aria-hidden>›</span>
            More filters{moreFilterCount > 0 && ` (${moreFilterCount})`}
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Max price
              <input name="max_price" type="number" min="0" defaultValue={search.max_price} placeholder="₹/day" className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Seats
              <input name="seats" type="number" min="1" max="12" defaultValue={search.seats} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Fuel
              <select name="fuel" defaultValue={search.fuel ?? ""} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="">Any</option><option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="electric">Electric</option><option value="cng">CNG</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              Gear
              <select name="transmission" defaultValue={search.transmission ?? ""} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="">Any</option><option value="manual">Manual</option><option value="automatic">Automatic</option><option value="gearless">Gearless</option>
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-ink-soft lg:col-span-1">
              Sort
              <select name="sort" defaultValue={search.sort ?? "price_asc"} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option><option value="newest">Newest</option>
              </select>
            </label>
          </div>
        </details>
      </Form>

      {vehicles.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={townSlug} locale={locale} eager={index < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
