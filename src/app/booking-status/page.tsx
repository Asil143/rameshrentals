import Form from "next/form";
import Link from "next/link";
import { BookingSummaryCard } from "@/components/booking-summary";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, lookupBooking } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { getLocale } from "@/lib/i18n/get-locale";
import { AdvancePayment } from "@/components/advance-payment";
import { getDictionary } from "@/lib/i18n/dictionary";

const inputClass =
  "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-normal text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20";

export default async function BookingStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; phone?: string }>;
}) {
  const { reference = "", phone = "" } = await searchParams;
  const booking = reference && phone ? await lookupBooking(reference, phone) : null;
  const town = booking ? await getTownBySlug(booking.town_slug) : null;
  const locale = await getLocale();
  const u = getDictionary(locale).ui;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold">{u.statusTitle}</h1>
      <p className="mt-2 text-ink-soft">{u.statusIntro}</p>

      <Form action="/booking-status" className="mt-6 grid gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
          {u.bookingReference}
          <input name="reference" defaultValue={reference} placeholder="RR-XXXXXXXXXX" required autoCapitalize="characters" className={`${inputClass} uppercase placeholder:normal-case`} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
          {u.phoneNumber}
          <input name="phone" defaultValue={phone} placeholder={u.phonePlaceholder} required type="tel" inputMode="numeric" pattern="\d{10}" maxLength={10} className={inputClass} />
        </label>
        <button className="rounded-xl bg-[var(--color-brand-800)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]">{u.check}</button>
      </Form>

      {reference && phone && !booking && (
        <div role="alert" className="mt-6 rounded-2xl border border-hairline bg-surface-raised p-5 text-sm">
          <p className="font-semibold">{u.noMatch}</p>
          <p className="mt-1 text-ink-soft">{u.noMatchHelp}</p>
          <WhatsAppButton href={whatsappGeneralLink(undefined, locale)} label={u.askWhatsApp} className="mt-4" />
        </div>
      )}

      {booking && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">{booking.reference}</p>
          <BookingSummaryCard booking={booking} u={u} />
          <AdvancePayment booking={booking} town={town} u={u} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton href={whatsappGeneralLink(booking.town_name, locale)} label={u.messageWhatsApp} className="justify-center" />
            <Link href={`/${booking.town_slug}/vehicles`} className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-ink-soft hover:underline">
              {u.browseMore}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
