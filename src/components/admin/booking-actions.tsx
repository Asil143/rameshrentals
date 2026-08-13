"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/app/actions";
import type { BookingStatus } from "@/types/database";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function set(next: BookingStatus) {
    startTransition(() => {
      void updateBookingStatus(bookingId, next as "confirmed" | "completed" | "cancelled");
    });
  }

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => set("confirmed")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Confirm
        </button>
        <button
          disabled={isPending}
          onClick={() => set("cancelled")}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <button
        disabled={isPending}
        onClick={() => set("completed")}
        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
      >
        Mark completed
      </button>
    );
  }

  return null;
}
