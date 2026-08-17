export const SITE_NAME = "Ramesh Rentals";

// Canonical production domain, used for sitemap/robots/structured-data URLs
// even before DNS is pointed at the deployment.
export const SITE_URL = "https://rameshrentals.com";

// TODO: replace with the real WhatsApp Business number (with country code, no + or spaces), e.g. "919876543210"
export const WHATSAPP_NUMBER = "919999999999";

export const TOWNS = [
  { slug: "addanki", name: "Addanki" },
  { slug: "ongole", name: "Ongole" },
  { slug: "markapur", name: "Markapur" },
  { slug: "darsi", name: "Darsi" },
  { slug: "martur", name: "Martur" },
] as const;

export const DEFAULT_TOWN_SLUG = "addanki";
