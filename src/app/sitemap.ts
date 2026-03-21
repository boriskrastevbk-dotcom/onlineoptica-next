import type { MetadataRoute } from "next";
import { wooGetCategories } from "@/lib/woo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://onlineoptica.com";
  const now = new Date();

  const categories = await wooGetCategories<any[]>({
    per_page: 100,
  });

  const categoryUrls = categories
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

  return [
    { url: base, lastModified: now },
    { url: `${base}/kontakti`, lastModified: now },
    { url: `${base}/usloviya-za-pazaruvane`, lastModified: now },
    { url: `${base}/poveritelnost`, lastModified: now },
    ...categoryUrls,
  ];
}
