"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink-soft">We couldn’t load this page. Please try again.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-[var(--color-brand-700)] px-5 py-2.5 font-semibold text-white">Try again</button>
    </div>
  );
}
