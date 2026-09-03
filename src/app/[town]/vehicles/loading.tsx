export default function VehiclesLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6" aria-label="Loading vehicles">
      <div className="mb-8 h-10 w-64 rounded-xl bg-[var(--color-border)]" />
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised"><div className="aspect-[16/11] bg-[var(--color-border)]" /><div className="space-y-3 p-4"><div className="h-5 w-3/4 rounded bg-[var(--color-border)]" /><div className="h-4 w-1/2 rounded bg-[var(--color-border)]" /><div className="h-10 rounded-xl bg-[var(--color-border)]" /></div></div>)}
      </div>
    </div>
  );
}
