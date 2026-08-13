import { WHATSAPP_NUMBER } from "@/lib/constants";
import type { Vehicle } from "@/types/database";

export function whatsappBookingLink(vehicle: Vehicle, townName: string) {
  const message = `Hi, I'd like to book the ${vehicle.make} ${vehicle.model} (${vehicle.type}) in ${townName}. Is it available?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappGeneralLink(townName?: string) {
  const message = townName
    ? `Hi, I'd like to rent a bike/car in ${townName}.`
    : "Hi, I'd like to rent a bike/car.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
