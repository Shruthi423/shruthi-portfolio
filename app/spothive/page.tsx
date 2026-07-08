import type { Metadata } from "next";
import { SpotHiveCaseStudy } from "@/app/components/case-studies/SpotHiveCaseStudy";

export const metadata: Metadata = {
  title: "SpotHive: 0-to-1 Workspace Booking Case Study | Shruthi",
  description:
    "SpotHive, a 0-to-1 workspace booking product shipped in one month at Sharp Corporation: a component-based design system and a live seat map with real-time availability, deployed across Sharp's global offices.",
  openGraph: {
    title: "SpotHive: 0-to-1 Workspace Booking Case Study",
    description:
      "A workspace booking product designed from zero in a month: a live seat map with real-time availability, rolled out across Sharp's global offices.",
    url: "https://shruthiaragonda.com/spothive",
    type: "article",
  },
};

export default function SpotHivePage() {
  return <SpotHiveCaseStudy />;
}
