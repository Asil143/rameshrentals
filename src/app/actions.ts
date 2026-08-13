"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEstimatedTotal } from "@/lib/pricing";
import type { PriceTier } from "@/types/database";

export type CreateBookingResult = { ok: true } | { ok: false; error: string };

export async function createBooking(formData: FormData): Promise<CreateBookingResult> {
  const vehicleId = formData.get("vehicle_id") as string;
  const townSlug = formData.get("town_slug") as string;
  const customerName = (formData.get("customer_name") as string)?.trim();
  const customerPhone = (formData.get("customer_phone") as string)?.trim();
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!vehicleId || !customerName || !customerPhone || !startDate || !endDate) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (!/^\d{10}$/.test(customerPhone)) {
    return { ok: false, error: "Enter a valid 10-digit phone number." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { ok: false, error: "End date must be on or after the start date." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("price_per_day, price_tiers")
    .eq("id", vehicleId)
    .single();

  const estimatedTotal = vehicle ? getEstimatedTotal(vehicle, startDate, endDate) : null;

  const { error } = await supabase.from("bookings").insert({
    vehicle_id: vehicleId,
    customer_id: user?.id ?? null,
    customer_name: customerName,
    customer_phone: customerPhone,
    start_date: startDate,
    end_date: endDate,
    estimated_total: estimatedTotal,
    status: "pending",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${townSlug}/vehicles/${vehicleId}`);
  revalidatePath("/bookings");
  return { ok: true };
}

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { supabase, ok: profile?.is_admin === true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "completed" | "cancelled"
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorized." };

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateVehicleStatus(
  vehicleId: string,
  status: "available" | "booked" | "maintenance"
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorized." };

  const { error } = await supabase
    .from("vehicles")
    .update({ status })
    .eq("id", vehicleId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function addVehicle(formData: FormData): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorized." };

  const townId = formData.get("town_id") as string;
  const type = formData.get("type") as string;
  const make = (formData.get("make") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const year = Number(formData.get("year"));
  const registrationNo = (formData.get("registration_no") as string)?.trim();
  const pricePerDay = Number(formData.get("price_per_day"));

  if (!townId || !make || !model || !year || !registrationNo || !pricePerDay) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (type !== "bike" && type !== "car") {
    return { ok: false, error: "Invalid vehicle type." };
  }

  const priceTiers: PriceTier[] = ([5, 10, 15] as const)
    .map((minDays) => ({
      min_days: minDays,
      price_per_day: Number(formData.get(`tier_${minDays}_price`)),
    }))
    .filter((tier) => tier.price_per_day > 0);

  for (let i = 1; i < priceTiers.length; i++) {
    if (priceTiers[i].price_per_day >= priceTiers[i - 1].price_per_day) {
      return { ok: false, error: "Longer-duration rates should be lower than shorter ones." };
    }
  }
  if (priceTiers[0]?.price_per_day >= pricePerDay) {
    return { ok: false, error: "Tier rates should be lower than the base price/day." };
  }

  const { data: platformOwner } = await supabase
    .from("owners")
    .select("id")
    .eq("type", "platform")
    .limit(1)
    .single();

  if (!platformOwner) {
    return { ok: false, error: "No platform owner found — run the seed SQL first." };
  }

  const { error } = await supabase.from("vehicles").insert({
    owner_id: platformOwner.id,
    town_id: townId,
    type,
    make,
    model,
    year,
    registration_no: registrationNo,
    price_per_day: pricePerDay,
    price_tiers: priceTiers,
    status: "available",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
