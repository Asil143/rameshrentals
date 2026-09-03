import { describe, expect, it } from "vitest";
import { getBookingDays, getDailyRate, getEstimatedTotal, getPricingRows } from "./pricing";

const vehicle = {
  price_per_day: 400,
  price_tiers: [
    { min_days: 5, price_per_day: 350 },
    { min_days: 10, price_per_day: 300 },
  ],
};

describe("pricing", () => {
  it("counts both pickup and return dates", () => {
    expect(getBookingDays("2026-09-03", "2026-09-03")).toBe(1);
    expect(getBookingDays("2026-09-03", "2026-09-07")).toBe(5);
  });

  it("uses the highest qualifying duration tier", () => {
    expect(getDailyRate(vehicle, 4)).toBe(400);
    expect(getDailyRate(vehicle, 5)).toBe(350);
    expect(getDailyRate(vehicle, 14)).toBe(300);
  });

  it("calculates inclusive totals", () => {
    expect(getEstimatedTotal(vehicle, "2026-09-03", "2026-09-07")).toBe(1750);
  });

  it("renders non-overlapping tier labels", () => {
    expect(getPricingRows(vehicle)).toEqual([
      { label: "1+ days", price_per_day: 400 },
      { label: "5-9 days", price_per_day: 350 },
      { label: "10+ days", price_per_day: 300 },
    ]);
  });
});
