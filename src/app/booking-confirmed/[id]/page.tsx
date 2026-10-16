import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSummaryCard } from "@/components/booking-summary";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getBookingSummary } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function BookingConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = /^[0-9a-f-]{36}$/i.test(id) ? await getBookingSummary({ p_booking_id: id }) : null;
  if (!booking) notFound();
  const locale = await getLocale();
  const u = getDictionary(locale).ui;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-2xl text-white shadow-brand" aria-hidden>
          ✓
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{u.requestReceived}</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          {u.requestReceivedBody}
        </p>
        <p className="mt-5 inline-flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-brand-500)]/40 bg-[var(--color-brand-500)]/6 px-6 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{u.yourReference}</span>
          <span className="font-display select-all text-2xl font-bold tracking-wide text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]">{booking.reference}</span>
        </p>
      </div>

      <BookingSummaryCard booking={booking} u={u} />

      {booking.payment_link && (
        <a href={booking.payment_link} className="mt-5 flex justify-center rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">
          {u.payAdvance}
        </a>
      )}

      <section className="mt-10">
        <h2 className="font-display mb-4 text-xl font-bold">{u.whatNext}</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {u.nextSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-hairline bg-surface-raised p-4">
              <span className="font-display text-sm font-bold text-[var(--color-brand-600)]">0{index + 1}</span>
              <h3 className="font-display mt-1 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton href={whatsappGeneralLink(booking.town_name, locale)} label={u.questionsWhatsApp} className="justify-center" />
        <Link
          href={`/booking-status?reference=${booking.reference}`}
          className="flex items-center justify-center rounded-full border border-hairline px-5 py-3 text-sm font-semibold"
        >
          {u.checkStatusLater}
        </Link>
        <Link href={`/${booking.town_slug}/vehicles`} className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-ink-soft hover:underline">
          {u.browseMore}
        </Link>
      </div>
    </div>
  );
}
