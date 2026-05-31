import type { Metadata } from "next";
import { UMSIExpoBadgesCaseStudy } from "../components/UMSIExpoBadgesCaseStudy";

export const metadata: Metadata = {
  title: "UMSI Expo Badges: Brand & Identity Case Study | Shruthi",
  description:
    "A pictogram badge system for the UMSI Exposition: one family of marks across hundreds of student posters, digital communications, and event signage.",
  openGraph: {
    title: "UMSI Expo Badges: Brand & Identity Case Study",
    description:
      "Pictogram badges for the UMSI Exposition: one family, hundreds of student posters, designed inside the U-M brand palette.",
    url: "https://shruthiaragonda.com/umsi-expo-badges",
    type: "article",
  },
};

export default function UMSIExpoBadgesPage() {
  return <UMSIExpoBadgesCaseStudy />;
}
