import type { Metadata } from "next";
import { DomuCaseStudy } from "@/app/components/case-studies/DomuCaseStudy";

export const metadata: Metadata = {
  title: "Domu: Hannah's Operations Platform | Shruthi",
  description:
    "Designing the ops view behind Hannah, Domu's AI voice agent: a division of labour that tells intended handoffs apart from genuine mistakes, instead of one scorecard that counts every transfer as a failure.",
  openGraph: {
    title: "Domu: Hannah's Operations Platform",
    description:
      "Hannah answers about 2,400 calls a day. Most of her transfers are the design working. A few are mistakes. The platform's credibility comes from telling the difference honestly.",
    url: "https://shruthiaragonda.com/domu",
    type: "article",
  },
};

export default function DomuPage() {
  return <DomuCaseStudy />;
}
