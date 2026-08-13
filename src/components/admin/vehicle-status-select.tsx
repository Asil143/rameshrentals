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
      className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10 dark:bg-black"
    >
      <option value="available">Available</option>
      <option value="booked">Booked</option>
      <option value="maintenance">Maintenance</option>
    </select>
  );
}
