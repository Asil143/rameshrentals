import { WHATSAPP_NUMBER } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { Vehicle } from "@/types/database";

export function whatsappBookingLink(vehicle: Vehicle, townName: string, locale: Locale = "en") {
  const message = getDictionary(locale).whatsapp.bookingMessage(
    vehicle.make,
    vehicle.model,
    vehicle.type,
    townName
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappGeneralLink(townName?: string, locale: Locale = "en") {
  const message = getDictionary(locale).whatsapp.generalMessage(townName);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
