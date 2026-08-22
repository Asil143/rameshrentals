export const SITE_NAME = "Ramesh Rentals";

// Canonical production domain, used for sitemap/robots/structured-data URLs
// even before DNS is pointed at the deployment.
export const SITE_URL = "https://rameshrentals.com";

export const WHATSAPP_NUMBER = "919727178763";

export const TOWNS = [
  { slug: "addanki", name: "Addanki" },
  { slug: "ongole", name: "Ongole" },
  { slug: "markapur", name: "Markapur" },
  { slug: "darsi", name: "Darsi" },
  { slug: "martur", name: "Martur" },
] as const;

export const DEFAULT_TOWN_SLUG = "addanki";
