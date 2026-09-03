import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-soft">The vehicle or page may no longer be available.</p>
      <Link href="/" className="mt-6 rounded-full bg-[var(--color-brand-700)] px-5 py-2.5 font-semibold text-white">Back home</Link>
    </div>
  );
}
