import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TOWN_SLUG, SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LanguageToggle } from "@/components/language-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import Image from "next/image";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let isOwner = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, owner_id")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
    isOwner = Boolean(profile?.owner_id);
  }

  const locale = await getLocale();
  const t = getDictionary(locale).header;
  const u = getDictionary(locale).ui;
  const footer = getDictionary(locale).footer;
  const linkClass = "font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]";
  const publicLinks = [
    { href: `/${DEFAULT_TOWN_SLUG}/vehicles`, label: u.browseVehicles },
    { href: "/booking-status", label: u.statusTitle },
    { href: "/about", label: footer.aboutPolicies },
    { href: "/concepts", label: u.hubLink },
    { href: `tel:+${WHATSAPP_NUMBER}`, label: `Call +91 ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}` },
  ];
  const accountLinks = [
    ...(isAdmin ? [{ href: "/admin", label: t.admin }] : []),
    ...(isOwner || isAdmin ? [{ href: "/owner", label: u.owner }] : []),
    { href: "/bookings", label: t.myBookings },
  ];

  return (
    <header className="sticky top-0 z-20 print:hidden border-b border-hairline bg-[var(--color-surface)]/80 backdrop-blur-lg backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <Image src="/brand-icon.png" alt="" width={38} height={38} loading="eager" className="rounded-xl shadow-soft transition-transform group-hover:scale-105" />
          <span className="hidden font-display text-lg font-bold tracking-tight min-[520px]:inline">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <span className="hidden items-center gap-4 lg:flex">
            <Link href={publicLinks[0].href} className={linkClass}>{publicLinks[0].label}</Link>
            <Link href={publicLinks[2].href} className={linkClass}>{publicLinks[2].label}</Link>
          </span>
          <Link
            href="/booking-status"
            className="hidden font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] sm:inline dark:hover:text-[var(--color-brand-400)]"
          >
            {u.status}
          </Link>
          {user ? (
            <>
              <span className="hidden items-center gap-4 sm:flex">
                {accountLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
                <SignOutButton locale={locale} />
              </span>
              <MobileMenu label={u.menu}>
                {[...publicLinks, ...accountLinks].map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2.5 font-medium hover:bg-[var(--color-border)]">
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-hairline px-3 pb-1 pt-2.5">
                  <SignOutButton locale={locale} />
                </div>
              </MobileMenu>
            </>
          ) : (
            <>
              <MobileMenu label={u.menu}>
                {publicLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2.5 font-medium hover:bg-[var(--color-border)]">
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-hairline px-3 pb-1 pt-2.5">
                  <Link href="/login" className="block font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]">{t.login}</Link>
                </div>
              </MobileMenu>
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-brand hover:brightness-105 active:scale-[0.97]"
              >
                {t.login}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
