"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function SignOutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await signOut();
        router.push("/");
        router.refresh();
      })}
      className="font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] disabled:opacity-60 dark:hover:text-[var(--color-brand-400)]"
    >
      {isPending ? "…" : getDictionary(locale).header.signOut}
    </button>
  );
}
