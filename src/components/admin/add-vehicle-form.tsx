"use client";

import { useRef, useState, useTransition } from "react";
import { addVehicle } from "@/app/actions";
import type { Town } from "@/types/database";

export function AddVehicleForm({ towns }: { towns: Town[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await addVehicle(formData);
      if (result.ok) {
        formRef.current?.reset();
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="grid gap-4 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Town
        <select name="town_id" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20">
          {towns.map((town) => (
            <option key={town.id} value={town.id}>
              {town.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Type
        <select name="type" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20">
          <option value="bike">Bike</option>
          <option value="car">Car</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Make
        <input name="make" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Model
        <input name="model" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Year
        <input name="year" type="number" min={1990} max={2100} required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Registration no.
        <input name="registration_no" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Price / day (₹) — base rate, 1+ days
        <input name="price_per_day" type="number" min={1} step="1" required className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Photo URL (optional)
        <input
          name="photo_url"
          type="text"
          placeholder="/vehicles/your-photo.jpg"
          className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Second photo URL (optional)
        <input
          name="photo_url_2"
          type="text"
          placeholder="/vehicles/your-photo-2.jpg"
          className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        />
      </label>

      <p className="text-xs text-ink-faint sm:col-span-2 lg:col-span-3">
        Photos must be paths under /public/vehicles. Add a second for a mini gallery on the vehicle page.
      </p>

      <div className="sm:col-span-2 lg:col-span-3">
        <p className="mb-2 text-sm font-medium">Long-term discount rates (optional)</p>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            5+ days (₹/day)
            <input name="tier_5_price" type="number" min={0} step="1" className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            10+ days (₹/day)
            <input name="tier_10_price" type="number" min={0} step="1" className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            15+ days (₹/day)
            <input name="tier_15_price" type="number" min={0} step="1" className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20" />
          </label>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          Leave blank to skip a tier. Each rate should be lower than the one before it.
        </p>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-2.5 font-semibold text-white shadow-soft transition-all hover:shadow-brand disabled:opacity-60 active:scale-[0.98]"
        >
          {isPending ? "Adding…" : "Add vehicle"}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{error}</p>}
      {success && <p role="status" className="text-sm text-emerald-700 sm:col-span-2 lg:col-span-3">Vehicle added.</p>}
    </form>
  );
}
