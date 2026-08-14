import type { PriceTier, Vehicle } from "@/types/database";

export function getBookingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

// Tiers apply once a booking runs `min_days` or more; the highest
// qualifying tier wins. Falls back to the base `price_per_day` rate.
export function getDailyRate(
  vehicle: Pick<Vehicle, "price_per_day" | "price_tiers">,
  days: number
): number {
  const qualifying = vehicle.price_tiers
    .filter((tier) => days >= tier.min_days)
    .sort((a, b) => b.min_days - a.min_days);

  return qualifying[0]?.price_per_day ?? vehicle.price_per_day;
}

export function getEstimatedTotal(
  vehicle: Pick<Vehicle, "price_per_day" | "price_tiers">,
  startDate: string,
  endDate: string
): number {
  const days = getBookingDays(startDate, endDate);
  if (days <= 0) return 0;
  return days * getDailyRate(vehicle, days);
}

// Base rate plus every tier, ascending — for rendering a pricing table.
export function getPricingRows(
  vehicle: Pick<Vehicle, "price_per_day" | "price_tiers">,
  daysWord: string = "days"
): { label: string; price_per_day: number }[] {
  const sortedTiers = [...vehicle.price_tiers].sort((a, b) => a.min_days - b.min_days);

  const rows = [{ label: `1+ ${daysWord}`, price_per_day: vehicle.price_per_day }];
  sortedTiers.forEach((tier: PriceTier, i) => {
    const next = sortedTiers[i + 1];
    const label = next
      ? `${tier.min_days}-${next.min_days - 1} ${daysWord}`
      : `${tier.min_days}+ ${daysWord}`;
    rows.push({ label, price_per_day: tier.price_per_day });
  });
  return rows;
}
