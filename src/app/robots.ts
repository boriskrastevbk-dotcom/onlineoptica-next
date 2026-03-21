import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/login",
          "/reset-password",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://onlineoptica.com/sitemap.xml",
  };
}
