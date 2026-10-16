import { createClient } from "@/lib/supabase/server";
import type { Testimonial, Vehicle, VehicleRating, VehicleType } from "@/types/database";

export type VehicleFilters = {
  type?: VehicleType;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  fuel?: string;
  transmission?: string;
  startDate?: string;
  endDate?: string;
  sort?: "price_asc" | "price_desc" | "newest";
};

const FUEL_TYPES = ["petrol", "diesel", "electric", "cng"] as const;
const TRANSMISSIONS = ["manual", "automatic", "gearless"] as const;

function isFuelType(value: string | undefined): value is (typeof FUEL_TYPES)[number] {
  return FUEL_TYPES.some((fuel) => fuel === value);
}

function isTransmission(value: string | undefined): value is (typeof TRANSMISSIONS)[number] {
  return TRANSMISSIONS.some((transmission) => transmission === value);
}

export async function getTownBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("towns")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getVehiclesForTown(
  townId: string,
  typeOrFilters?: VehicleType | VehicleFilters
): Promise<Vehicle[]> {
  const supabase = await createClient();
  const filters = typeof typeOrFilters === "string" ? { type: typeOrFilters } : typeOrFilters ?? {};
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("town_id", townId)
    .eq("status", "available");

  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.minPrice) {
    query = query.gte("price_per_day", filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte("price_per_day", filters.maxPrice);
  }
  if (filters.seats) {
    query = query.gte("seats", filters.seats);
  }
  if (isFuelType(filters.fuel)) {
    query = query.eq("fuel_type", filters.fuel);
  }
  if (isTransmission(filters.transmission)) {
    query = query.eq("transmission", filters.transmission);
  }
  if (filters.q) {
    const term = filters.q.replaceAll("%", "").replaceAll(",", " ").trim();
    if (term) query = query.or(`make.ilike.%${term}%,model.ilike.%${term}%`);
  }
  if (filters.sort === "price_desc") {
    query = query.order("price_per_day", { ascending: false });
  } else if (filters.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("price_per_day", { ascending: true });
  }

  const { data } = await query;
  const vehicles = data ?? [];
  const startDate = filters.startDate;
  const endDate = filters.endDate;
  if (!startDate || !endDate) return vehicles;

  const checked = await Promise.all(
    vehicles.map(async (vehicle) => {
      const { data: overlaps } = await supabase.rpc("vehicle_has_overlap", {
        p_vehicle_id: vehicle.id,
        p_start: startDate,
        p_end: endDate,
      });
      return overlaps ? null : vehicle;
    })
  );
  return checked.filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
  return data;
}

export async function getActiveTowns() {
  const supabase = await createClient();
  const { data } = await supabase.from("towns").select("*").eq("active", true);
  return data ?? [];
}

export async function getAllTowns() {
  const supabase = await createClient();
  const { data } = await supabase.from("towns").select("*").order("name");
  return data ?? [];
}

export async function getAllAvailableVehicleUrls() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, town:towns(slug)")
    .eq("status", "available");
  return data ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

export async function lookupBooking(reference: string, phone: string) {
  const normalizedReference = reference.trim().toUpperCase();
  const normalizedPhone = phone.trim().replace(/\D/g, "").slice(-10);
  if (!normalizedReference || normalizedPhone.length !== 10) return null;
  return getBookingSummary({ p_reference: normalizedReference, p_phone: normalizedPhone });
}

/** Booking details safe to show a guest who holds the booking id or reference + phone. */
export async function getBookingSummary(args: { p_booking_id?: string; p_reference?: string; p_phone?: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_booking_summary", args);
  return data?.[0] ?? null;
}

/** Average rating and review count per vehicle, keyed by vehicle id. */
export async function getVehicleRatings(vehicleIds: string[]) {
  if (vehicleIds.length === 0) return new Map<string, VehicleRating>();
  const supabase = await createClient();
  const { data } = await supabase.from("vehicle_rating_summary").select("*").in("vehicle_id", vehicleIds);
  return new Map((data ?? []).map((row) => [row.vehicle_id, { ...row, average: Number(row.average) }]));
}

export async function getVehicleReviews(vehicleId: string, limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_reviews")
    .select("id, reviewer_name, rating, comment, created_at")
    .eq("vehicle_id", vehicleId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getReviewBookingInfo(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("review_booking_info", { p_booking_id: bookingId });
  return data?.[0] ?? null;
}
