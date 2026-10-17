import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects, uses, and protects booking information.`,
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).privacy;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-sm text-ink-faint">{t.lastUpdated}</p>
      <div className="mt-8 space-y-6 leading-relaxed text-ink-soft">
        {t.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
