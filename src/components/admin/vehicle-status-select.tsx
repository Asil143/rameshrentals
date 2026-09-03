"use client";

import { useState, useTransition } from "react";
import { updateVehicleStatus } from "@/app/actions";
import type { VehicleStatus } from "@/types/database";

export function VehicleStatusSelect({
  vehicleId,
  status,
}: {
  vehicleId: string;
  status: VehicleStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
    <select
      value={current}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as VehicleStatus;
        const previous = current;
        setCurrent(next);
        setError(null);
        startTransition(async () => {
          const result = await updateVehicleStatus(vehicleId, next);
          if (!result.ok) {
            setCurrent(previous);
            setError(result.error);
          }
        });
      }}
      className="rounded-full border border-hairline bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium outline-none transition-colors focus:border-[var(--color-brand-500)]"
    >
      <option value="available">Available</option>
      <option value="booked">Booked</option>
      <option value="maintenance">Maintenance</option>
    </select>
    {error && <span role="alert" className="max-w-48 text-xs text-red-600">{error}</span>}
    </div>
  );
}
