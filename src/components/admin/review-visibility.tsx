"use client";

import { useTransition } from "react";
import { setReviewHidden } from "@/app/actions";

export function ReviewVisibility({ reviewId, hidden }: { reviewId: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => void (await setReviewHidden(reviewId, !hidden)))}
      className="rounded-full border border-hairline px-3 py-1 text-xs font-semibold disabled:opacity-60"
    >
      {hidden ? "Show" : "Hide"}
    </button>
  );
}
