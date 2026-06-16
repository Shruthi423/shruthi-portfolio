import type { MetadataRoute } from "next";

const SITE_URL = "https://shruthiaragonda.com";

// The real, navigable routes. /background is a dev reference page and the
// per-project detail routes (/temple, /zuge…) don't exist yet, so neither is
// listed. Add project pages here as they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/onki`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/temple`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/zuge`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/kodif`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/feeld`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/handmade-homestead`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/playground`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
