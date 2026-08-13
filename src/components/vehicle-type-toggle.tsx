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
    <div className="inline-flex rounded-lg border border-black/10 p-1 dark:border-white/10">
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
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
