import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getActiveTowns, getAllAvailableVehicleUrls } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [towns, vehicles] = await Promise.all([
    getActiveTowns(),
    getAllAvailableVehicleUrls(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const townEntries: MetadataRoute.Sitemap = towns.map((town) => ({
    url: `${SITE_URL}/${town.slug}/vehicles`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const vehicleEntries: MetadataRoute.Sitemap = vehicles
    .filter((vehicle) => vehicle.town?.slug)
    .map((vehicle) => ({
      url: `${SITE_URL}/${vehicle.town!.slug}/vehicles/${vehicle.id}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  return [...staticEntries, ...townEntries, ...vehicleEntries];
}
