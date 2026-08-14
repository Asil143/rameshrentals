"use client";

import { useTransition } from "react";
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

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as VehicleStatus;
        startTransition(() => {
          void updateVehicleStatus(vehicleId, next);
        });
      }}
      className="rounded-full border border-hairline bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium outline-none transition-colors focus:border-[var(--color-brand-500)]"
    >
      <option value="available">Available</option>
      <option value="booked">Booked</option>
      <option value="maintenance">Maintenance</option>
    </select>
  );
}
