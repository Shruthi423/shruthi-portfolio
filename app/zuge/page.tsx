import type { Metadata } from "next";
import { ZugeCaseStudy } from "@/app/components/case-studies/ZugeCaseStudy";

export const metadata: Metadata = {
  title: "Zuge: Two Seconds, Eyes Down | Shruthi",
  description:
    "End-to-end UX and interaction design for an EV bike dashboard for India's delivery riders. A 7-inch screen, glanceable at speed, that cut phone use ~73%.",
  openGraph: {
    title: "Zuge: Two Seconds, Eyes Down",
    description:
      "Designing a delivery-first EV dashboard for 2M+ gig riders: full-screen navigation, minimal overlays, glanceable at 25mph.",
    url: "https://shruthiaragonda.com/zuge",
    type: "article",
  },
};

export default function ZugePage() {
  return <ZugeCaseStudy />;
}
