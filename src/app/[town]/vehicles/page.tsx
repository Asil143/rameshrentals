import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TownSelector } from "@/components/town-selector";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleTypeToggle } from "@/components/vehicle-type-toggle";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getAllTowns, getTownBySlug, getVehicleRatings, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { SITE_NAME } from "@/lib/constants";
import type { Vehicle, VehicleType } from "@/types/database";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { formatShortDate, formatTime, parseDateRange } from "@/lib/format";
import { formatRupees } from "@/lib/pricing";
import { toJsonLdScript } from "@/lib/json-ld";

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
  const u = getDictionary(locale).ui;

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

  const dateRange = parseDateRange(search.start_date, search.end_date);
  const ratings = await getVehicleRatings(vehicles.map((vehicle) => vehicle.id));
  // FAQ answers come from this town's real data: prices, fees and opening hours.
  const anyFilter = Object.values(search).some(Boolean);
  const allTownVehicles = anyFilter ? await getVehiclesForTown(town.id) : vehicles;
  const cheapest = (type: VehicleType) => {
    const prices = allTownVehicles.filter((vehicle) => vehicle.type === type).map((vehicle) => Number(vehicle.price_per_day));
    return prices.length ? formatRupees(Math.min(...prices)) : null;
  };
  const faqs = [
    { q: u.faqPriceQ(town.name), a: u.faqPriceA(cheapest("bike"), cheapest("car")) },
    { q: u.faqDeliveryQ(town.name), a: u.faqDeliveryA(Number(town.delivery_fee) > 0 ? formatRupees(town.delivery_fee) : null) },
    { q: u.faqPayQ, a: u.faqPayA },
    { q: u.faqDocsQ, a: u.documentsBody },
    { q: u.faqCancelQ, a: u.cancellationBody },
    { q: u.faqHoursQ, a: u.faqHoursA(formatTime(town.opening_time, u.dateLocale), formatTime(town.closing_time, u.dateLocale)) },
  ];

  // Quick filters: one tap sets a filter, a second tap clears it. A chip only
  // shows when at least one vehicle in this town matches it.
  const BUDGET = 400;
  const quickFilters = [
    { key: "transmission", value: "gearless", label: u.chips.scooter, matches: (v: Vehicle) => v.transmission === "gearless" },
    { key: "max_price", value: String(BUDGET), label: u.chips.budget(formatRupees(BUDGET)), matches: (v: Vehicle) => Number(v.price_per_day) <= BUDGET },
    { key: "seats", value: "7", label: u.chips.sevenSeater, matches: (v: Vehicle) => (v.seats ?? 0) >= 7 },
    { key: "transmission", value: "automatic", label: u.chips.automatic, matches: (v: Vehicle) => v.transmission === "automatic" },
  ]
    .filter((chip) => allTownVehicles.some(chip.matches))
    .map((chip) => {
      const params = new URLSearchParams(Object.entries(search).filter((entry): entry is [string, string] => Boolean(entry[1])));
      const active = params.get(chip.key) === chip.value;
      if (active) params.delete(chip.key);
      else params.set(chip.key, chip.value);
      const query = params.toString();
      return { ...chip, active, href: `/${townSlug}/vehicles${query ? `?${query}` : ""}` };
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

      {quickFilters.length > 0 && (
        <nav aria-label={u.filter} className="-mt-4 mb-6 flex flex-wrap gap-2">
          {quickFilters.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              aria-pressed={chip.active}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                chip.active
                  ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-white"
                  : "border-hairline bg-surface-raised text-ink-soft hover:border-[var(--color-brand-500)]"
              }`}
            >
              {chip.active && "✓ "}
              {chip.label}
            </Link>
          ))}
        </nav>
      )}

      <Form action={`/${townSlug}/vehicles`} className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft lg:grid-cols-6">
        {vehicleType && <input type="hidden" name="type" value={vehicleType} />}
        <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          {u.search}
          <input name="q" defaultValue={search.q} placeholder="Swift, Activa, Ertiga..." className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          {u.fromDate}
          <input name="start_date" type="date" defaultValue={search.start_date} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
          {u.toDate}
          <input name="end_date" type="date" defaultValue={search.end_date} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
        </label>
        <div className="col-span-2 flex items-end gap-2 max-lg:order-last">
          <button className="flex-1 rounded-xl bg-[var(--color-brand-800)] px-4 py-2.5 text-sm font-semibold text-white lg:flex-none lg:py-2">{u.filter}</button>
          <Link href={`/${townSlug}/vehicles${vehicleType ? `?type=${vehicleType}` : ""}`} className="rounded-xl border border-hairline px-4 py-2.5 text-sm font-semibold lg:py-2">{u.reset}</Link>
        </div>
        <details open={moreFilterCount > 0} className="group col-span-2 lg:col-span-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)] [&::-webkit-details-marker]:hidden">
            <span className="transition-transform group-open:rotate-90" aria-hidden>›</span>
            {u.moreFilters}{moreFilterCount > 0 && ` (${moreFilterCount})`}
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              {u.maxPrice}
              <input name="max_price" type="number" min="0" defaultValue={search.max_price} placeholder={u.pricePerDayPlaceholder} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              {u.seats}
              <input name="seats" type="number" min="1" max="12" defaultValue={search.seats} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              {u.fuel}
              <select name="fuel" defaultValue={search.fuel ?? ""} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="">{u.any}</option><option value="petrol">{u.fuels.petrol}</option><option value="diesel">{u.fuels.diesel}</option><option value="electric">{u.fuels.electric}</option><option value="cng">{u.fuels.cng}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
              {u.gear}
              <select name="transmission" defaultValue={search.transmission ?? ""} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="">{u.any}</option><option value="manual">{u.gears.manual}</option><option value="automatic">{u.gears.automatic}</option><option value="gearless">{u.gears.gearless}</option>
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-ink-soft lg:col-span-1">
              {u.sort}
              <select name="sort" defaultValue={search.sort ?? "price_asc"} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-ink)]">
                <option value="price_asc">{u.sorts.priceAsc}</option><option value="price_desc">{u.sorts.priceDesc}</option><option value="newest">{u.sorts.newest}</option>
              </select>
            </label>
          </div>
        </details>
      </Form>

      {search.start_date && search.end_date && (
        <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[var(--color-brand-500)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-brand-800)] dark:text-[var(--color-brand-100)]">
          ✓ {u.freeBetween(formatShortDate(search.start_date, u.dateLocale), formatShortDate(search.end_date, u.dateLocale))}
          <Link href={`/${townSlug}/vehicles${vehicleType ? `?type=${vehicleType}` : ""}`} className="font-normal underline">
            {u.clearDates}
          </Link>
        </p>
      )}

      {vehicles.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={townSlug} locale={locale} eager={index < 2} dates={dateRange} rating={ratings.get(vehicle.id)} />
          ))}
        </div>
      )}

      <section className="mt-16 max-w-3xl">
        <p className="text-ink-soft">{u.townIntro(town.name, vehicles.length)}</p>
        <h2 className="font-display mt-8 text-2xl font-bold">{u.faqTitle(town.name)}</h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-hairline bg-surface-raised px-5 py-4 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span aria-hidden className="text-ink-faint transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLdScript({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
            }),
          }}
        />
      </section>
    </div>
  );
}
