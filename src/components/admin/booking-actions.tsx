"use client";

import { useState, useTransition } from "react";
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
  const [message, setMessage] = useState<string | null>(null);

  function set(next: BookingStatus) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, next as "confirmed" | "completed" | "cancelled");
      setMessage(result.ok ? "Updated" : result.error);
    });
  }

  const feedback = message && (
    <span role="status" aria-live="polite" className="text-xs text-ink-faint">{message}</span>
  );

  if (status === "pending") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={isPending}
          onClick={() => set("confirmed")}
          className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:brightness-105 disabled:opacity-60"
        >
          Confirm
        </button>
        <button
          disabled={isPending}
          onClick={() => set("cancelled")}
          className="rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-[var(--color-border-strong)] disabled:opacity-60"
        >
          Cancel
        </button>
        {feedback}
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="flex items-center gap-2"><button
        disabled={isPending}
        onClick={() => set("completed")}
        className="rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-[var(--color-border-strong)] disabled:opacity-60"
      >
        Mark completed
      </button>{feedback}</div>
    );
  }

  return null;
}
