import type { Metadata } from "next";
import { OnkiCaseStudy } from "@/app/components/case-studies/OnkiCaseStudy";

export const metadata: Metadata = {
  title: "Onki / AICap — AI Sommelier Case Study | Shruthi",
  description:
    "Designing an AI sommelier for the wine aisle — a voice + touch retail kiosk for conversational wine discovery, built at Onki AI (NYC).",
  openGraph: {
    title: "Onki / AICap — AI Sommelier Case Study",
    description:
      "A voice + touch retail kiosk that helps shoppers discover wine through conversational AI.",
    url: "https://shruthiaragonda.com/onki",
    type: "article",
  },
};

export default function OnkiPage() {
  return <OnkiCaseStudy />;
}
