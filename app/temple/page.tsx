import type { Metadata } from "next";
import { TempleCaseStudy } from "@/app/components/case-studies/TempleCaseStudy";

export const metadata: Metadata = {
  title: "Temple — Scaling Sacred Ticketing | Shruthi",
  description:
    "Digital darshan ticketing for Srisailam, built as a free pilot and scaled to 174 temples statewide. A product case study on offline-first design, crowd control, and scope discipline.",
  openGraph: {
    title: "Temple — Scaling a Sacred Experience for Millions",
    description:
      "A free-pilot bet that became Andhra Pradesh's temple booking platform: offline-first darshan ticketing, scaled from 1 temple to 174.",
    url: "https://shruthiaragonda.com/temple",
    type: "article",
  },
};

export default function TemplePage() {
  return <TempleCaseStudy />;
}
