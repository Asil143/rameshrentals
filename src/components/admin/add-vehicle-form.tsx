"use client";

import { useRef, useState, useTransition } from "react";
import { addVehicle } from "@/app/actions";
import type { Town } from "@/types/database";

export function AddVehicleForm({ towns }: { towns: Town[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addVehicle(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="grid gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10"
    >
      <label className="flex flex-col gap-1 text-sm">
        Town
        <select name="town_id" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black">
          {towns.map((town) => (
            <option key={town.id} value={town.id}>
              {town.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Type
        <select name="type" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black">
          <option value="bike">Bike</option>
          <option value="car">Car</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Make
        <input name="make" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Model
        <input name="model" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Year
        <input name="year" type="number" min={1990} max={2100} required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Registration no.
        <input name="registration_no" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Price / day (₹) — base rate, 1+ days
        <input name="price_per_day" type="number" min={1} step="1" required className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
      </label>

      <div className="sm:col-span-2 lg:col-span-3">
        <p className="mb-2 text-sm font-medium">Long-term discount rates (optional)</p>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            5+ days (₹/day)
            <input name="tier_5_price" type="number" min={0} step="1" className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            10+ days (₹/day)
            <input name="tier_10_price" type="number" min={0} step="1" className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            15+ days (₹/day)
            <input name="tier_15_price" type="number" min={0} step="1" className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black" />
          </label>
        </div>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          Leave blank to skip a tier. Each rate should be lower than the one before it.
        </p>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? "Adding…" : "Add vehicle"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{error}</p>}
    </form>
  );
}
