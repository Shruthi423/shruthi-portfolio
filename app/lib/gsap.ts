/**
 * Central GSAP setup. Import `gsap` / `useGSAP` / plugins from here so
 * registration happens exactly once.
 *
 * Currently active: ScrollTrigger (case-study pinned sweeps + reveals on
 * scroll), SplitText (word/char-level reveals), Observer (home three-panel
 * snap slider). To add another plugin,
 * import it below and add it to the registerPlugin call — all GSAP plugins
 * are free.
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";

// Plugins touch `window`, so only register in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Observer);
}

export { gsap, useGSAP, ScrollTrigger, SplitText, Observer };
