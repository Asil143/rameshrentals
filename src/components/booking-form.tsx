"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions";

export function BookingForm({
  vehicleId,
  townSlug,
}: {
  vehicleId: string;
  townSlug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

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
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
        Booking request sent! We&apos;ll call you shortly to confirm. You can
        pay the deposit and rent at pickup.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="town_slug" value={townSlug} />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Start date
          <input
            type="date"
            name="start_date"
            min={today}
            required
            className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          End date
          <input
            type="date"
            name="end_date"
            min={today}
            required
            className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          type="text"
          name="customer_name"
          required
          className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Phone number
        <input
          type="tel"
          name="customer_phone"
          pattern="\d{10}"
          maxLength={10}
          placeholder="10-digit mobile number"
          required
          className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Sending request…" : "Request Booking"}
      </button>
      <p className="text-xs text-black/50 dark:text-white/50">
        No payment now — pay the deposit and rent in cash or UPI at pickup.
      </p>
    </form>
  );
}
