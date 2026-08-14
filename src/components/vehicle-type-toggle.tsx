import Link from "next/link";

export function VehicleTypeToggle({
  townSlug,
  current,
}: {
  townSlug: string;
  current: "all" | "bike" | "car";
}) {
  const options: { label: string; value: "all" | "bike" | "car" }[] = [
    { label: "All", value: "all" },
    { label: "Bikes", value: "bike" },
    { label: "Cars", value: "car" },
  ];

  return (
    <div className="inline-flex rounded-full border border-hairline bg-surface-raised p-1 shadow-soft">
      {options.map((option) => {
        const href =
          option.value === "all"
            ? `/${townSlug}/vehicles`
            : `/${townSlug}/vehicles?type=${option.value}`;
        const isActive = option.value === current;
        return (
          <Link
            key={option.value}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-soft"
                : "text-ink-soft hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
