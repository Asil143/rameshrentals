"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/app/actions";
import type { Locale } from "@/lib/i18n/dictionary";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLanguage(next);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-hairline bg-surface-raised p-0.5 text-xs font-semibold shadow-soft">
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("en")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white"
            : "text-ink-soft"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("te")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "te"
            ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white"
            : "text-ink-soft"
        }`}
      >
        తె
      </button>
    </div>
  );
}
