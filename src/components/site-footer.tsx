import Link from "next/link";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import Image from "next/image";
import { getAllTowns } from "@/lib/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function SiteFooter() {
  const locale = await getLocale();
  const towns = await getAllTowns();
  const t = getDictionary(locale).footer;

  return (
    <footer className="mt-auto border-t border-hairline bg-surface-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <Image src="/brand-icon.png" alt="" width={34} height={34} className="rounded-lg" />
              <span className="font-display text-base font-bold">{SITE_NAME}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">{t.blurb}</p>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="mt-4 inline-block text-sm font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]">+91 97271 78763</a>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {t.whereWeOperate}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {towns.map((town) => (
                <li key={town.slug}>
                  <Link
                    href={`/${town.slug}/vehicles`}
                    className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                  >
                    {town.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {t.company}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                >
                  {t.aboutPolicies}
                </Link>
              </li>
              <li>
                <Link
                  href="/concepts"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] hover:underline dark:hover:text-[var(--color-brand-400)]"
                >
                  Shed concepts
                </Link>
              </li>
              <li><Link href="/privacy" className="text-ink-soft hover:text-[var(--color-brand-700)] hover:underline dark:hover:text-[var(--color-brand-400)]">{t.privacyPolicy}</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {t.account}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                >
                  {t.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                >
                  {t.myBookings}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6 text-xs text-ink-faint">
          {t.copyright(new Date().getFullYear(), SITE_NAME)}
        </div>
      </div>
    </footer>
  );
}
