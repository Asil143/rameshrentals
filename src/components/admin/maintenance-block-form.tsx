"use client";

import { useState, useTransition } from "react";
import { addMaintenanceBlock } from "@/app/actions";
import type { Vehicle } from "@/types/database";

export function MaintenanceBlockForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const input = "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm";

  return (
    <form action={(data) => startTransition(async () => { const result = await addMaintenanceBlock(data); setMessage(result.ok ? "Maintenance block added." : result.error); })} className="grid gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
      <label className="grid gap-1 text-sm font-medium lg:col-span-2">Vehicle
        <select name="vehicle_id" required className={input}>
          {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} · {vehicle.registration_no}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">Start<input name="start_date" type="date" required className={input} /></label>
      <label className="grid gap-1 text-sm font-medium">End<input name="end_date" type="date" required className={input} /></label>
      <label className="grid gap-1 text-sm font-medium">Reason<input name="reason" defaultValue="Maintenance" maxLength={160} className={input} /></label>
      <button disabled={pending} className="rounded-xl bg-[var(--color-brand-800)] px-4 py-2.5 text-sm font-semibold text-white lg:col-start-5">{pending ? "Saving..." : "Block dates"}</button>
      {message && <p className="text-sm text-ink-soft sm:col-span-full">{message}</p>}
    </form>
  );
}
