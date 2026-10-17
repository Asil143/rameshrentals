"use client";

import { useSyncExternalStore } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

function readLocale(): Locale {
  const match = typeof document === "undefined" ? null : document.cookie.match(/(?:^|; )lang=(en|te)(?:;|$)/);
  return match?.[1] === "te" ? "te" : "en";
}

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale: Locale = useSyncExternalStore(() => () => {}, readLocale, () => "en" as Locale);
  const u = getDictionary(locale).ui;

  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">{u.errorTitle}</h1>
      <p className="mt-2 text-ink-soft">{u.errorBody}</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-[var(--color-brand-700)] px-5 py-2.5 font-semibold text-white">{u.tryAgain}</button>
    </div>
  );
}
