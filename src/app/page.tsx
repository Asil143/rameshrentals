import Link from "next/link";
import Image from "next/image";
import { VehicleCard } from "@/components/vehicle-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getAllTowns, getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { DEFAULT_TOWN_SLUG, GOOGLE_BUSINESS_URL, GOOGLE_REVIEW_URL, SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { toJsonLdScript } from "@/lib/json-ld";
import { TownSelector } from "@/components/town-selector";

const FEATURE_ICONS = [
  <path
    key="delivery"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 12.75V18a1.5 1.5 0 0 0 1.5 1.5h1.128M16.5 19.5h-9m9 0a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 1 3 0m-9-15h6a1.5 1.5 0 0 1 1.5 1.5v9.75m-9-11.25L3 7.5m6.75-3v11.25M3 7.5v6.75a1.5 1.5 0 0 0 1.5 1.5H6m11.25-8.25H21l-3.75 4.5H19.5v3.75m-9-9.75h5.25"
  />,
  <path
    key="wallet"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 8.25h19.5M2.25 9v10.5A1.5 1.5 0 0 0 3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V9M2.25 9V6.75A1.5 1.5 0 0 1 3.75 5.25h16.5a1.5 1.5 0 0 1 1.5 1.5V9M6 15h4.5"
  />,
  <path
    key="chat"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M8.25 10.875c0 .621.504 1.125 1.125 1.125h.375m4.5-1.125c0 .621-.504 1.125-1.125 1.125h-.375m0 0v1.5m0-1.5h-3m6.75-6H5.625c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h.375v3l3.9-3h9.6c.621 0 1.125-.504 1.125-1.125v-9.75c0-.621-.504-1.125-1.125-1.125Z"
  />,
  <path
    key="shield"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="m9 12.75 1.5 1.5 3.75-3.75M21 12c0 5.25-3.75 8.25-9 9.75C6.75 20.25 3 17.25 3 12V6.108c0-.87.62-1.62 1.475-1.786a48.57 48.57 0 0 1 15.05 0c.855.166 1.475.916 1.475 1.786V12Z"
  />,
];

export default async function Home() {
  const [town, towns] = await Promise.all([getTownBySlug(DEFAULT_TOWN_SLUG), getAllTowns()]);
  const vehicles = town ? await getVehiclesForTown(town.id) : [];
  const activeTownCount = towns.filter((item) => item.active).length;

  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.home;
  const townName = town?.name ?? "Addanki";
  const townList = towns.map((tn) => tn.name).join(", ");

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: towns.map((tn) => ({ "@type": "City", name: tn.name })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(localBusinessJsonLd) }}
      />
      <section className="relative overflow-hidden bg-[var(--color-brand-900)] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_15%,rgba(53,169,123,.4),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(244,183,64,.22),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent-400)]" /> {t.badge(townName)}
            </span>
            <h1 className="font-display mt-6 max-w-2xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
              {t.heroLine1} <span className="text-[var(--color-accent-400)]">{t.heroLine2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-white/75 sm:text-lg">{t.subtitle(SITE_NAME, townList)}</p>
            <div className="mt-7 max-w-md rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
              <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-[.14em] text-white/65">Where do you need a vehicle?</label>
              <TownSelector currentSlug={DEFAULT_TOWN_SLUG} towns={towns} prominent />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href={`/${DEFAULT_TOWN_SLUG}/vehicles`} className="rounded-xl bg-[var(--color-accent-400)] px-6 py-3.5 font-semibold text-[var(--color-brand-900)] shadow-lift transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-300)]">{t.browseCta(townName)}</Link>
              <WhatsAppButton href={whatsappGeneralLink(town?.name, locale)} label={t.bookViaWhatsapp} className="shadow-lift" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] border border-white/10 bg-white/5" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 shadow-2xl">
              <Image src="/vehicles/maruti-suzuki-ertiga.webp" alt="Maruti Suzuki Ertiga available from Ramesh Rentals" fill preload sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-300)]">Real local fleet</p>
                <p className="mt-1 font-display text-xl font-semibold">Clean, inspected, ready to go.</p>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-7 lg:col-span-2">
            <div>
              <dt className="sr-only">{t.statTowns}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">{activeTownCount}</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statTowns}</dd>
            </div>
            <div>
              <dt className="sr-only">{t.statVehicles}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">{vehicles.length}+</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statVehicles}</dd>
            </div>
            <div>
              <dt className="sr-only">{t.statPayAtPickup}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">₹0</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statPayAtPickup}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-b border-hairline bg-surface-raised">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 py-4 sm:grid-cols-4 sm:px-6">
          {t.features.map((feature, index) => (
            <div key={feature.title} className="flex items-center gap-3 px-3 py-3 text-sm font-semibold">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-700)]">{index + 1}</span>
              {feature.title}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Link href={`/${DEFAULT_TOWN_SLUG}/vehicles?type=bike`} className="group relative min-h-64 overflow-hidden rounded-3xl bg-[var(--color-brand-900)] shadow-soft">
            <Image src="/vehicles/royal-enfield-classic-350-side.webp" alt="Browse rental bikes" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-sm text-white/70">Easy local travel</p><h2 className="font-display text-3xl font-bold">{dictionary.listing.typeBikes}</h2><span className="mt-3 inline-block font-semibold text-[var(--color-accent-300)]">Browse bikes →</span></div>
          </Link>
          <Link href={`/${DEFAULT_TOWN_SLUG}/vehicles?type=car`} className="group relative min-h-64 overflow-hidden rounded-3xl bg-[var(--color-brand-900)] shadow-soft">
            <Image src="/vehicles/maruti-suzuki-swift-angle.webp" alt="Browse rental cars" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-sm text-white/70">Comfort for every trip</p><h2 className="font-display text-3xl font-bold">{dictionary.listing.typeCars}</h2><span className="mt-3 inline-block font-semibold text-[var(--color-accent-300)]">Browse cars →</span></div>
          </Link>
        </div>
      </section>

      {vehicles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                {t.readyToRide}
              </p>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {t.availableNow(townName)}
              </h2>
            </div>
            <Link
              href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
              className="hidden shrink-0 text-sm font-semibold text-[var(--color-brand-700)] hover:underline sm:block dark:text-[var(--color-brand-400)]"
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {vehicles.slice(0, 8).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={DEFAULT_TOWN_SLUG} locale={locale} />
            ))}
          </div>
          <Link
            href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
            className="mt-6 block text-center text-sm font-semibold text-[var(--color-brand-700)] hover:underline sm:hidden dark:text-[var(--color-brand-400)]"
          >
            {t.viewAllVehicles}
          </Link>
        </section>
      )}

      <section className="border-y border-hairline bg-surface-raised">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {t.whyChooseUs}
          </p>
          <h2 className="font-display mb-8 text-2xl font-bold sm:text-3xl">{t.whySiteName(SITE_NAME)}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((feature, i) => (
              <div
                key={feature.title}
                className="card-hover rounded-2xl border border-hairline bg-[var(--color-surface)] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-soft">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    {FEATURE_ICONS[i]}
                  </svg>
                </div>
                <h3 className="mb-1.5 font-display font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-9 max-w-xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">Simple from start to finish</p>
          <h2 className="font-display text-3xl font-bold">On the road in three steps</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {dictionary.about.steps.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-hairline bg-surface-raised p-6 shadow-soft">
              <span className="font-display text-5xl font-extrabold text-[var(--color-brand-500)]/15">0{index + 1}</span>
              <h3 className="font-display mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {(GOOGLE_BUSINESS_URL || GOOGLE_REVIEW_URL) && <section className="border-y border-hairline bg-[var(--color-brand-900)] text-white"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-10 sm:flex-row sm:items-center sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-300)]">Local and accountable</p><h2 className="font-display mt-1 text-2xl font-bold">See what real customers say</h2><p className="mt-1 text-sm text-white/70">Reviews are hosted and verified by Google.</p></div><div className="flex gap-3">{GOOGLE_BUSINESS_URL && <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[var(--color-brand-900)]">View on Google</a>}{GOOGLE_REVIEW_URL && <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer" className="rounded-xl bg-[var(--color-accent-400)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-900)]">Leave a review</a>}</div></div></section>}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
          {t.coverage}
        </p>
        <h2 className="font-display mb-6 text-2xl font-bold sm:text-3xl">{t.whereWeOperate}</h2>
        <div className="flex flex-wrap gap-3">
          {towns.map((tn) => (
            <Link
              key={tn.slug}
              href={`/${tn.slug}/vehicles`}
              className="group flex items-center gap-2 rounded-full border border-hairline bg-surface-raised px-5 py-2.5 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-500)] hover:shadow-lift"
            >
              {tn.name}
              <span className="text-ink-faint transition-colors group-hover:text-[var(--color-brand-600)]">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
