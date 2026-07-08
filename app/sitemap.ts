import type { MetadataRoute } from "next";

const SITE_URL = "https://shruthiaragonda.com";

// The real, navigable routes. The work grid lives on the home (`/`) now, so
// there's no standalone /work. /background is a dev reference page, so it's
// left out. Case studies are ordered to match the home grid.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const caseStudies = [
    "/kodif", "/zuge", "/spothive", "/temple",
    "/onki", "/handmade-homestead", "/feeld",
    // "/umsi-expo-badges" — hidden until finished
  ];
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/playground`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
