import type { Metadata } from "next";
import { HandmadeHomesteadCaseStudy } from "@/app/components/case-studies/HandmadeHomesteadCaseStudy";

export const metadata: Metadata = {
  title: "Handmade Homestead — Brand & Social Case Study | Shruthi",
  description:
    "Building a homesteading lifestyle brand from identity to audience: a warm, earthy visual system and a social campaign that grew through reels and shares.",
  openGraph: {
    title: "Handmade Homestead — Brand & Social Case Study",
    description:
      "A handcrafted brand identity and social campaign for a modern homestead, grown from zero to 152.6K views.",
    url: "https://shruthiaragonda.com/handmade-homestead",
    type: "article",
  },
};

export default function HandmadeHomesteadPage() {
  return <HandmadeHomesteadCaseStudy />;
}
