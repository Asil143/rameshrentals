"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionary";
import type { FulfillmentMethod, PriceTier } from "@/types/database";

export async function setLanguage(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export type CreateBookingResult = { ok: true } | { ok: false; error: string };

export async function createBooking(formData: FormData): Promise<CreateBookingResult> {
  const vehicleId = formData.get("vehicle_id") as string;
  const townSlug = formData.get("town_slug") as string;
  const customerName = (formData.get("customer_name") as string)?.trim();
  const customerPhone = (formData.get("customer_phone") as string)?.trim();
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const acceptedPolicy = formData.get("accept_policy") === "on";
  const fulfillmentMethod = formData.get("fulfillment_method") as FulfillmentMethod;

  const honeypot = formData.get("website");
  if (honeypot) return { ok: true };

  if (!vehicleId || !customerName || !customerPhone || !startDate || !endDate) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (!acceptedPolicy) {
    return { ok: false, error: "Please accept the booking and privacy policies." };
  }
  if (fulfillmentMethod !== "doorstep_delivery" && fulfillmentMethod !== "location_pickup") {
    return { ok: false, error: "Choose delivery or location pickup." };
  }
  if (customerName.length < 2 || customerName.length > 100) {
    return { ok: false, error: "Enter a name between 2 and 100 characters." };
  }
  if (!/^\d{10}$/.test(customerPhone)) {
    return { ok: false, error: "Enter a valid 10-digit phone number." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { ok: false, error: "Choose valid booking dates." };
  }
  const days = Math.round(
    (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000
  ) + 1;
  if (!Number.isFinite(days) || days < 1 || days > 31) {
    return { ok: false, error: "Bookings must be between 1 and 31 days." };
  }
  // Compare as IST calendar dates regardless of the server's own timezone —
  // the business and every customer are in India, and this form has no
  // client-side re-check once submitted (the calendar UI only disables past
  // dates visually), so a crafted or stale request could otherwise slip a
  // past start date through.
  const todayIst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date()
  );
  if (startDate < todayIst) {
    return { ok: false, error: "Start date can't be in the past." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_booking_request_v2", {
    p_vehicle_id: vehicleId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_start: startDate,
    p_end: endDate,
    p_accept_policy: acceptedPolicy,
    p_fulfillment_method: fulfillmentMethod,
  });

  if (error) {
    console.error("Booking request failed", { code: error.code });
    if (error.message.includes("DATES_UNAVAILABLE") || error.code === "23P01") {
      return { ok: false, error: "Those dates are no longer available. Please choose different dates." };
    }
    if (error.message.includes("RATE_LIMITED")) {
      return { ok: false, error: "Too many recent requests. Please wait 15 minutes and try again." };
    }
    if (error.message.includes("VEHICLE_UNAVAILABLE")) {
      return { ok: false, error: "This vehicle isn't available for booking right now." };
    }
    return { ok: false, error: "We couldn't create the booking. Please try again." };
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

  if (error) {
    console.error("Booking status update failed", { code: error.code });
    return { ok: false, error: "Couldn't update the booking. Please try again." };
  }

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

  if (error) {
    console.error("Vehicle status update failed", { code: error.code });
    return { ok: false, error: "Couldn't update the vehicle. Please try again." };
  }

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
  const photoUrl = (formData.get("photo_url") as string)?.trim();
  const photoUrl2 = (formData.get("photo_url_2") as string)?.trim();

  if (!townId || !make || !model || !year || !registrationNo || !pricePerDay) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (type !== "bike" && type !== "car") {
    return { ok: false, error: "Invalid vehicle type." };
  }
  if (make.length > 60 || model.length > 60 || registrationNo.length > 20) {
    return { ok: false, error: "Vehicle details are too long." };
  }
  if (!Number.isInteger(year) || year < 1990 || year > 2100 || !Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return { ok: false, error: "Enter a valid year and daily price." };
  }
  const photoUrls = [photoUrl, photoUrl2].filter((url): url is string => Boolean(url));
  if (photoUrls.some((url) => !/^\/vehicles\/[a-zA-Z0-9._/-]+$/.test(url))) {
    return { ok: false, error: "Photos must be paths under /public/vehicles." };
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
    photos: photoUrls,
    status: "available",
  });

  if (error) {
    console.error("Vehicle creation failed", { code: error.code });
    return { ok: false, error: "Couldn't add the vehicle. Check for duplicate registration details." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
