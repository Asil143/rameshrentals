import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehicleById, getVehicleRatings, getVehicleReviews, getVehiclesForTown } from "@/lib/queries";
import { VehicleCard } from "@/components/vehicle-card";
import { whatsappBookingLink } from "@/lib/whatsapp";
import { getPricingRows, formatRupees } from "@/lib/pricing";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { toJsonLdScript } from "@/lib/json-ld";
import type { Metadata } from "next";
import { formatLongDate, formatShortDate, parseDateRange } from "@/lib/format";

const PLACEHOLDER_IMAGE = { bike: "🏍️", car: "🚗" } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string; id: string }>;
}): Promise<Metadata> {
  const { town: townSlug, id } = await params;
  const [town, vehicle] = await Promise.all([getTownBySlug(townSlug), getVehicleById(id)]);

  if (!town || !vehicle) {
    return { title: `Vehicle not found | ${SITE_NAME}` };
  }

  const title = `${vehicle.make} ${vehicle.model} rental in ${town.name} | ${SITE_NAME}`;
  const description = `Rent the ${vehicle.make} ${vehicle.model} in ${town.name} from ₹${vehicle.price_per_day}/day. Choose doorstep delivery or location pickup.`;
  const imageUrl = vehicle.photos[0] ? `${SITE_URL}${vehicle.photos[0]}` : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${townSlug}/vehicles/${id}` },
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ town: string; id: string }>;
  searchParams: Promise<{ start_date?: string; end_date?: string }>;
}) {
  const { town: townSlug, id } = await params;
  const { start_date, end_date } = await searchParams;
  const dateRange = parseDateRange(start_date, end_date);

  const [town, vehicle] = await Promise.all([
    getTownBySlug(townSlug),
    getVehicleById(id),
  ]);

  if (!town || !vehicle || vehicle.town_id !== town.id) {
    notFound();
  }

  // Up to 4 other vehicles of the same type in this town, closest in price first.
  const similar = (await getVehiclesForTown(town.id, vehicle.type))
    .filter((other) => other.id !== vehicle.id)
    .sort((a, b) => Math.abs(a.price_per_day - vehicle.price_per_day) - Math.abs(b.price_per_day - vehicle.price_per_day))
    .slice(0, 4);
  const [ratings, reviews] = await Promise.all([getVehicleRatings([vehicle.id, ...similar.map((other) => other.id)]), getVehicleReviews(vehicle.id)]);
  const rating = ratings.get(vehicle.id);
  const locale = await getLocale();
  const t = getDictionary(locale).vehicleDetail;
  const u = getDictionary(locale).ui;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.make} ${vehicle.model}`,
    image: vehicle.photos[0] ? `${SITE_URL}${vehicle.photos[0]}` : undefined,
    description: `${vehicle.type === "bike" ? "Bike" : "Car"} rental in ${town.name}`,
    offers: {
      "@type": "Offer",
      price: vehicle.price_per_day,
      priceCurrency: "INR",
      availability:
        vehicle.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${townSlug}/vehicles/${vehicle.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(productJsonLd) }}
      />
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 pb-28 sm:px-6 md:grid-cols-2 md:pb-10">
      {/* Photo stays in view on wide screens while the booking form scrolls. */}
      <div className="md:sticky md:top-24 md:self-start">
        {vehicle.photos.length > 0 ? (
          <VehicleGallery photos={vehicle.photos} alt={`${vehicle.make} ${vehicle.model}`} />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] text-8xl shadow-soft dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]">
            <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 md:self-start">
        <div>
          <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {u.vehicleType[vehicle.type]} · {town.name}
          </span>
          <h1 className="font-display text-3xl font-bold">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-ink-faint">
            {vehicle.year}
            {rating && (
              <a href="#reviews" className="ml-2 font-semibold text-[var(--color-brand-700)] hover:underline dark:text-[var(--color-brand-400)]">
                {u.ratingSummary(rating.average.toFixed(1), rating.review_count)}
              </a>
            )}
          </p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-extrabold">{formatRupees(vehicle.price_per_day)}</span>
          <span className="text-ink-faint">{t.perDay}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-hairline bg-surface-raised p-3"><span className="block text-xs text-ink-faint">{u.vehicle}</span><strong>{u.vehicleType[vehicle.type]}</strong></div>
          <div className="rounded-xl border border-hairline bg-surface-raised p-3"><span className="block text-xs text-ink-faint">{u.modelYear}</span><strong>{vehicle.year}</strong></div>
          <div className="rounded-xl border border-hairline bg-surface-raised p-3"><span className="block text-xs text-ink-faint">{u.handover}</span><strong>{u.deliveryOrPickup}</strong></div>
          <div className="rounded-xl border border-hairline bg-surface-raised p-3"><span className="block text-xs text-ink-faint">{u.refundableDeposit}</span><strong>{formatRupees(vehicle.type === "bike" ? 1000 : 5000)}</strong></div>
        </div>
        {(vehicle.fuel_type || vehicle.transmission || vehicle.seats) && <div className="flex flex-wrap gap-2 text-xs text-ink-soft">{vehicle.fuel_type && <span className="rounded-full border border-hairline px-3 py-1.5 ">{u.fuels[vehicle.fuel_type]}</span>}{vehicle.transmission && <span className="rounded-full border border-hairline px-3 py-1.5 ">{u.gears[vehicle.transmission]}</span>}{vehicle.seats && <span className="rounded-full border border-hairline px-3 py-1.5">{u.seatsCount(vehicle.seats)}</span>}</div>}
        {town.pickup_address && <div className="rounded-2xl border border-hairline bg-surface-raised p-4 text-sm"><span className="block text-xs font-semibold uppercase tracking-wider text-ink-faint">{u.pickupLocation}</span><p className="mt-1">{town.pickup_address}</p>{town.maps_url && <a href={town.maps_url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-[var(--color-brand-700)]">Open in Google Maps →</a>}</div>}

        <section className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft">
          <h2 className="mb-3 font-display text-sm font-semibold">{u.whatsIncluded}</h2>
          <ul className="space-y-2.5 text-sm">
            {[
              u.depositReturned(formatRupees(vehicle.type === "bike" ? 1000 : 5000)),
              u.unlimitedKm,
              vehicle.helmet_count > 0 ? u.helmets(vehicle.helmet_count) : null,
              u.fuelPolicy,
              vehicle.last_inspected_at ? u.checkedOn(formatLongDate(vehicle.last_inspected_at, u.dateLocale)) : null,
            ]
              .filter((item): item is string => Boolean(item))
              .map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)]/15 text-xs font-bold text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]">✓</span>
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
          </ul>
        </section>

        <section aria-label={u.beforeYouBook} className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: "↺", title: u.cancellationTitle, body: u.cancellationBody },
            { icon: "🪪", title: u.documentsTitle, body: u.documentsBody },
            {
              icon: "🏠",
              title: u.deliveryTitle,
              body: u.deliveryBody(
                town.delivery_radius_km,
                Number(town.delivery_fee) > 0 ? formatRupees(town.delivery_fee) : null,
                Number(town.collection_fee) > 0 ? formatRupees(town.collection_fee) : null
              ),
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-hairline bg-surface-raised p-4 text-sm last:sm:col-span-2">
              <p className="flex items-center gap-2 font-display font-semibold">
                <span aria-hidden className="text-[var(--color-brand-600)]">{item.icon}</span>
                {item.title}
              </p>
              <p className="mt-1 text-ink-soft">{item.body}</p>
            </div>
          ))}
        </section>

        <section id="reviews" className="scroll-mt-24 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft">
          <h2 className="font-display text-sm font-semibold">
            {u.reviewsTitle}
            {rating && <span className="ml-2 font-normal text-ink-soft">{u.ratingSummary(rating.average.toFixed(1), rating.review_count)}</span>}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{u.noReviewsYet}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {reviews.map((review) => (
                <li key={review.id} className="border-t border-hairline pt-3 text-sm first:border-t-0 first:pt-0">
                  <p className="font-semibold">
                    <span className="text-[var(--color-accent-500)]" aria-label={u.starsLabel(review.rating)}>
                      {"★".repeat(review.rating)}
                      <span className="text-[var(--color-border-strong)]">{"★".repeat(5 - review.rating)}</span>
                    </span>{" "}
                    {review.reviewer_name}
                    <span className="ml-2 text-xs font-normal text-ink-faint">{formatShortDate(review.created_at.slice(0, 10), u.dateLocale)}</span>
                  </p>
                  {review.comment && <p className="mt-1 text-ink-soft">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {vehicle.price_tiers.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-display font-semibold">{t.longerYouRent}</h2>
            <table className="w-full text-sm">
              <tbody>
                {getPricingRows(vehicle, t.daysWord).map((row) => (
                  <tr key={row.label} className="border-t border-hairline first:border-t-0">
                    <td className="py-2 text-ink-soft">{row.label}</td>
                    <td className="py-2 text-right font-semibold">
                      {formatRupees(row.price_per_day)}
                      {t.perDay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div id="booking" className="scroll-mt-24 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:p-6">
          <h2 className="mb-4 font-display font-semibold">{t.requestThisBooking}</h2>
          <BookingForm
            vehicleId={vehicle.id}
            townSlug={townSlug}
            pricePerDay={vehicle.price_per_day}
            priceTiers={vehicle.price_tiers}
            deliveryFee={town.delivery_fee ?? 0}
            collectionFee={town.collection_fee ?? 0}
            locale={locale}
            initialStart={dateRange?.start}
            initialEnd={dateRange?.end}
            depositAmount={vehicle.type === "bike" ? 1000 : 5000}
            protectionPerDay={Number(vehicle.type === "bike" ? town.protection_fee_bike : town.protection_fee_car) || 0}
            protectionTerms={town.protection_terms}
          />
          <Link
            href="/about#policy"
            className="mt-3 block text-center text-xs text-ink-faint hover:text-[var(--color-brand-700)] hover:underline dark:hover:text-[var(--color-brand-400)]"
          >
            {t.policyLink}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-faint">{t.or}</span>
          <WhatsAppButton
            href={whatsappBookingLink(vehicle, town.name, locale)}
            label={t.bookViaWhatsapp}
          />
        </div>
      </div>
    </div>
    {similar.length > 0 && (
      <section className="mx-auto max-w-5xl px-4 pb-28 sm:px-6 md:pb-14">
        <h2 className="font-display mb-4 text-xl font-bold">{u.similarVehicles}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {similar.map((other) => (
            <VehicleCard key={other.id} vehicle={other} townSlug={townSlug} locale={locale} dates={dateRange} rating={ratings.get(other.id)} />
          ))}
        </div>
      </section>
    )}
    </>
  );
}
