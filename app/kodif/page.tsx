import type { Metadata } from "next";
import { KodifCaseStudy } from "../components/KodifCaseStudy";

export const metadata: Metadata = {
  title: "Kodif — Shaping an AI Concierge for E-Commerce | Shruthi",
  description:
    "Realigning Kodif's brand to its e-commerce AI product: a website redesign, a lower-friction integrations flow, and a growth-asset system that tripled referral sign-ups.",
  openGraph: {
    title: "Kodif — Shaping an AI Concierge for E-Commerce",
    description:
      "Closing the gap between Kodif's brand and product: web redesign, integrations, and growth collateral. ~30% less onboarding friction, 3× referral sign-ups.",
    url: "https://shruthiaragonda.com/kodif",
    type: "article",
  },
};

export default function KodifPage() {
  return <KodifCaseStudy />;
}
