"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function ReviewForm({ bookingId, locale }: { bookingId: string; locale: Locale }) {
  const u = getDictionary(locale).ui;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <p className="rounded-2xl bg-[var(--color-brand-500)]/10 p-5 font-semibold text-[var(--color-brand-800)] dark:text-[var(--color-brand-100)]">{u.reviewThanks}</p>;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      setError(u.reviewChooseRating);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReview(bookingId, rating, comment);
      if (result.ok) setDone(true);
      else setError(u.reviewFailed);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:p-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{u.yourRating}</legend>
        <div className="flex gap-1.5" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={u.starsLabel(n)}
              onClick={() => setRating(n)}
              className={`text-4xl leading-none transition-transform hover:scale-110 ${n <= rating ? "text-[var(--color-accent-400)]" : "text-[var(--color-border-strong)]"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {u.commentLabel}
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={600}
          className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-5 py-3 font-display font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {u.submitReview}
      </button>
    </form>
  );
}
