import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function NotFound() {
  const u = getDictionary(await getLocale()).ui;
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">{u.notFoundTitle}</h1>
      <p className="mt-2 text-ink-soft">{u.notFoundBody}</p>
      <Link href="/" className="mt-6 rounded-full bg-[var(--color-brand-700)] px-5 py-2.5 font-semibold text-white">{u.backHome}</Link>
    </div>
  );
}
