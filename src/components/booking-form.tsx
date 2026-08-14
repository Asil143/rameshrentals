"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions";
import { getBookingDays, getEstimatedTotal } from "@/lib/pricing";
import type { PriceTier } from "@/types/database";

const inputClass =
  "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20";

export function BookingForm({
  vehicleId,
  townSlug,
  pricePerDay,
  priceTiers,
}: {
  vehicleId: string;
  townSlug: string;
  pricePerDay: number;
  priceTiers: PriceTier[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const days =
    startDate && endDate ? getBookingDays(startDate, endDate) : 0;
  const estimatedTotal =
    days > 0 ? getEstimatedTotal({ price_per_day: pricePerDay, price_tiers: priceTiers }, startDate, endDate) : 0;

  function handleSubmit(formData: FormData) {
    setError(null);
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
        <p className="mb-0.5 font-display font-semibold">Booking request sent!</p>
        We&apos;ll call you shortly to confirm. You can pay the deposit and rent
        at pickup.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="town_slug" value={townSlug} />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Start date
          <input
            type="date"
            name="start_date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          End date
          <input
            type="date"
            name="end_date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className={inputClass}
          />
        </label>
      </div>

      {days > 0 && (
        <div className="rounded-xl bg-[var(--color-accent-400)]/12 px-4 py-3 text-sm">
          <span className="text-ink-soft">
            {days} day{days > 1 ? "s" : ""} · ₹{Math.round(estimatedTotal / days)}/day
          </span>{" "}
          <span className="font-display font-semibold text-[var(--color-accent-600)]">
            ≈ ₹{estimatedTotal.toLocaleString("en-IN")} estimated
          </span>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Your name
        <input type="text" name="customer_name" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Phone number
        <input
          type="tel"
          name="customer_phone"
          pattern="\d{10}"
          maxLength={10}
          placeholder="10-digit mobile number"
          required
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-5 py-3 font-display font-semibold text-white shadow-soft transition-all hover:shadow-brand disabled:opacity-60 active:scale-[0.98]"
      >
        {isPending ? "Sending request…" : "Request Booking"}
      </button>
      <p className="text-xs text-ink-faint">
        No payment now — pay the deposit and rent in cash or UPI at pickup.
      </p>
    </form>
  );
}
