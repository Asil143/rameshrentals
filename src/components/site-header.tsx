import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LanguageToggle } from "@/components/language-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  const locale = await getLocale();
  const t = getDictionary(locale).header;

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-[var(--color-surface)]/80 backdrop-blur-lg backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image src="/brand-icon.png" alt="" width={38} height={38} className="rounded-xl shadow-soft transition-transform group-hover:scale-105" />
          <span className="hidden font-display text-lg font-bold tracking-tight min-[520px]:inline">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
            >
              {t.admin}
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/bookings"
                className="font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
              >
                {t.myBookings}
              </Link>
              <SignOutButton locale={locale} />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-brand hover:brightness-105 active:scale-[0.97]"
            >
              {t.login}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
