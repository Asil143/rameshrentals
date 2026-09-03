"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { createBooking } from "@/app/actions";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { getBookingDays, getEstimatedTotal } from "@/lib/pricing";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { PriceTier } from "@/types/database";

const inputClass =
  "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20";

export function BookingForm({
  vehicleId,
  townSlug,
  pricePerDay,
  priceTiers,
  locale = "en",
}: {
  vehicleId: string;
  townSlug: string;
  pricePerDay: number;
  priceTiers: PriceTier[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).bookingForm;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const handleAvailabilityChange = useCallback((ready: boolean) => setAvailabilityReady(ready), []);

  const days =
    startDate && endDate ? getBookingDays(startDate, endDate) : 0;
  const estimatedTotal =
    days > 0 ? getEstimatedTotal({ price_per_day: pricePerDay, price_tiers: priceTiers }, startDate, endDate) : 0;

  function handleSubmit(formData: FormData) {
    setError(null);
    if (!startDate || !endDate) {
      setError(t.selectDatesError);
      return;
    }
    if (!availabilityReady) {
      setError("Availability is still loading. Please try again in a moment.");
      return;
    }
    startTransition(async () => {
      const result = await createBooking(formData);
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-xl border border-[var(--color-brand-500)]/25 bg-[var(--color-brand-500)]/10 p-4 text-sm text-[var(--color-brand-800)] dark:text-[var(--color-brand-100)]">
        <p className="mb-0.5 font-display font-semibold">{t.successTitle}</p>
        {t.successBody}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="town_slug" value={townSlug} />
      <input type="hidden" name="start_date" value={startDate} />
      <input type="hidden" name="end_date" value={endDate} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px opacity-0"
      />

      <div className="flex flex-col gap-1.5 text-sm font-medium">
        <div className="grid grid-cols-2 gap-3 text-xs text-ink-soft">
          <span>
            {t.startDate}: <span className="font-semibold text-[var(--color-ink)]">{startDate || "—"}</span>
          </span>
          <span>
            {t.endDate}: <span className="font-semibold text-[var(--color-ink)]">{endDate || "—"}</span>
          </span>
        </div>
        <AvailabilityCalendar
          vehicleId={vehicleId}
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          onAvailabilityChange={handleAvailabilityChange}
          locale={locale}
        />
      </div>

      {days > 0 && (
        <div className="rounded-xl bg-[var(--color-accent-400)]/12 px-4 py-3 text-sm">
          <span className="text-ink-soft">
            {t.estimateDays(days, Math.round(estimatedTotal / days))}
          </span>{" "}
          <span className="font-display font-semibold text-[var(--color-accent-600)]">
            {t.estimateTotal(estimatedTotal.toLocaleString("en-IN"))}
          </span>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.yourName}
        <input type="text" name="customer_name" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.phoneNumber}
        <input
          type="tel"
          name="customer_phone"
          pattern="\d{10}"
          maxLength={10}
          placeholder={t.phonePlaceholder}
          required
          className={inputClass}
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="accept_policy" required className="mt-0.5 h-4 w-4 accent-[var(--color-brand-600)]" />
        <span>{t.acceptPrefix} <Link href="/about#policy" className="underline">{t.bookingPolicy}</Link> {t.and} <Link href="/privacy" className="underline">{t.privacyPolicy}</Link>.</span>
      </label>

      {error && <p role="alert" aria-live="polite" className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || !availabilityReady}
        className="mt-1 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-5 py-3 font-display font-semibold text-white shadow-soft transition-all hover:shadow-brand disabled:opacity-60 active:scale-[0.98]"
      >
        {isPending ? t.submitting : t.submit}
      </button>
      <p className="text-xs text-ink-faint">{t.payAtPickupNote}</p>
    </form>
  );
}
