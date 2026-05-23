import type { MetadataRoute } from "next";

const SITE_URL = "https://shruthiaragonda.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/background", // dev reference page, not for indexing
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
