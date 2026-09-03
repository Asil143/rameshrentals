import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects, uses, and protects booking information.`,
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Privacy policy</h1>
      <p className="mt-2 text-sm text-ink-faint">Last updated: September 3, 2026</p>
      <div className="mt-8 space-y-6 leading-relaxed text-ink-soft">
        <section><h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">Information we collect</h2><p>We collect your name, phone number, requested dates, selected vehicle, and account identifier when you request a booking or sign in.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">How we use it</h2><p>We use this information only to process rentals, contact you about a request, prevent fraud, maintain records, and comply with legal obligations. We do not sell personal information.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">Retention and security</h2><p>Booking records are retained only as long as required for operations, disputes, and applicable law. Access is restricted to authorized administrators.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">Your choices</h2><p>You may ask us on WhatsApp to access, correct, or delete your information, subject to records we must legally retain.</p></section>
      </div>
    </article>
  );
}
