"use client";

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-xl bg-[var(--color-brand-700)] px-5 py-3 font-semibold text-white print:hidden">Print / save PDF</button>;
}
