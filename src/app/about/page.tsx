import type { Metadata } from "next";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { SITE_NAME, TOWNS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: `About & Booking Policy | ${SITE_NAME}`,
  description:
    "How booking works, documents required, security deposit, damage and cancellation policy for Ramesh Rentals bike & car rentals.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).about;
  const townList = TOWNS.map((tn) => tn.name).join(", ");

  return (
    <div>
      <section className="mesh-hero px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            {t.badge}
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/75">{t.subtitle(SITE_NAME)}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="font-display mb-8 text-center text-2xl font-bold">{t.howItWorks}</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <div
              key={step.title}
              className="card-hover rounded-2xl border border-hairline bg-surface-raised p-6"
            >
              <span className="font-display mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-sm font-bold text-white shadow-soft">
                {i + 1}
              </span>
              <h3 className="mb-1.5 font-display font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="policy" className="scroll-mt-20 border-y border-hairline bg-surface-raised">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <h2 className="font-display mb-8 text-center text-2xl font-bold">{t.policyTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {t.policies.map((policy) => (
              <div
                key={policy.title}
                className="rounded-2xl border border-hairline bg-[var(--color-surface)] p-6"
              >
                <h3 className="mb-1.5 font-display font-semibold">{policy.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{policy.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="font-display mb-3 text-2xl font-bold">{t.questionsTitle}</h2>
        <p className="mb-6 text-ink-soft">{t.questionsBody(townList)}</p>
        <div className="flex justify-center">
          <WhatsAppButton href={whatsappGeneralLink(undefined, locale)} label={t.chatCta} />
        </div>
      </section>
    </div>
  );
}
