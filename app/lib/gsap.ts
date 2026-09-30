/**
 * Central GSAP setup. Import `gsap` / `useGSAP` / plugins from here so
 * registration happens exactly once.
 *
 * Currently active: ScrollTrigger (case-study pinned sweeps + reveals on
 * scroll), ScrollSmoother (the home one-pager's weighted scroll) and SplitText
 * (word/char-level reveals). To add another plugin, import it below and add it
 * to the registerPlugin call — all GSAP plugins are free.
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

// Plugins touch `window`, so only register in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, SplitText };
