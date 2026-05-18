/**
 * Central GSAP setup. Import `gsap` / `useGSAP` / plugins from here so
 * registration happens exactly once.
 *
 * Registered for the planned work: smooth scroll + parallax (ScrollSmoother
 * needs ScrollTrigger), card reveals (ScrollTrigger), and the hero text
 * effect (ScrambleTextPlugin + SplitText). To use another plugin, import it
 * below and add it to the registerPlugin call — all GSAP plugins are free.
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

// Plugins touch `window`, so only register in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollSmoother,
    ScrambleTextPlugin,
    SplitText,
  );
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, SplitText };
