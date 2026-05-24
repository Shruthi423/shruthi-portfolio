import type { Metadata } from "next";
import { FeeldCaseStudy } from "../components/FeeldCaseStudy";

export const metadata: Metadata = {
  title: "Feeld — Know Yourself, Sense the Room | Shruthi",
  description:
    "A 48-hour FigBuild concept: a wearable that reads the energy field around you, and your own. A study in speculative UX, and in restraint.",
  openGraph: {
    title: "Feeld — Know Yourself, Sense the Room",
    description:
      "A contact lens and wristband that read a person's energy field in real time. Five live dimensions, one breathing aura, consent built into the interaction.",
    url: "https://shruthiaragonda.com/feeld",
    type: "article",
  },
};

export default function FeeldPage() {
  return <FeeldCaseStudy />;
}
