import type { MetadataRoute } from "next";
import { wooGetCategories } from "@/lib/woo";

type WooCategory = {
  slug: string;
  name: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://onlineoptica.com";
  const now = new Date();

  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const categories = await wooGetCategories<WooCategory[]>({
      per_page: 100,
    });

    categoryUrls = categories
      .filter(
        (c) =>
          c.slug !== "uncategorized" &&
          c.slug !== "bez-kategoriya" &&
          c.name !== "Uncategorized" &&
          c.name !== "Без категория"
      )
      .map((c) => ({
        url: `${base}/c/${c.slug}`,
        lastModified: now,
      }));
  } catch (error) {
    console.error("sitemap categories fetch failed:", error);
  }

  return [
    { url: base, lastModified: now },
    { url: `${base}/kontakti`, lastModified: now },
    { url: `${base}/usloviya-za-pazaruvane`, lastModified: now },
    { url: `${base}/poveritelnost`, lastModified: now },
    ...categoryUrls,
  ];
}
