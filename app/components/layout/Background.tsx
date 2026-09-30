"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/app/lib/gsap";

/* ------------------------------------------------------------------ *
 * Background — an animated, hand-drawn illustrated world, split into
 * composable pieces so it can integrate with the real site:
 *   <BackgroundStyles />  — the shared <style> block (render once)
 *   <SkyScene />          — the flat sky-colour backdrop content scrolls over
 *   <GrasslandScene />    — savanna hills, animals + fireflies (the /background
 *                           preview route only; the footer has no scenery)
 *   <FogReveal />         — the paper-fog main → footer scroll transition
 *
 * The day/night bat toggles were removed along with dark mode: the portfolio
 * is light-only, and the one dark surface (the footer) is painted directly by
 * FootprintsHome's `inverted` prop rather than by a global polarity.
 * ------------------------------------------------------------------ */

// Static, deterministic scatter data (no Math.random — SSR-safe).
// Fireflies (night) — a deterministic scatter (no Math.random) so SSR + client
// markup match. Dense swarm; per-bug size/drift/brightness for a lively shimmer.
const FIREFLIES = Array.from({ length: 70 }, (_, i) => ({
  x: 2 + ((i * 23) % 96),
  bottom: 14 + ((i * 37) % 176),
  d: ((i * 13) % 90) / 10, // delay 0–8.9s
  dur: 3.0 + ((i * 7) % 45) / 10, // 3.0–7.4s
  rise: 5 + (i % 5), // vertical drift px
  sway: 3 + (i % 4), // horizontal drift px
  size: 3 + (i % 4), // core diameter 3–6px
  bright: i % 4 === 0, // ~1 in 4 burns brighter
}));


const CSS = `
/* ---- sky scene (fills whatever it's placed in) ---- */
.bg-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: var(--bg);
  transition: background-color 1.2s ease;
}

/* ---- atmospheric haze: the footer emerges from a soft paper fog ----
   No literal cloud shapes. A fixed, paper-toned veil over the bottom of the
   viewport, painted BEHIND main's page content (z-index:-1 inside the z-indexed
   content layer) but ABOVE the fixed footer — so it mists ONLY the revealed
   footer, never the page content in front of it. A scrubbed ScrollTrigger fades
   it in then out across the seam (see FogReveal), so the footer surfaces out of
   a fog that builds then dissipates. Subtle: opacity + a touch of blur, no
   sliding. */
.fog-sentinel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px; /* invisible scroll marker at the very bottom of main's content */
  pointer-events: none;
}
.fog-veil {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72vh;
  z-index: -1; /* behind page content (same layer), still above the fixed footer */
  opacity: 0; /* JS scrubs this up then back down across the seam */
  pointer-events: none;
  background: linear-gradient(
    to top,
    var(--bg) 0%,
    var(--bg) 34%,
    color-mix(in srgb, var(--bg) 58%, transparent) 68%,
    transparent 100%
  );
  -webkit-backdrop-filter: blur(7px);
  backdrop-filter: blur(7px);
}
@media (max-width: 640px) {
  .fog-veil { height: 60vh; }
}
@media (prefers-reduced-motion: reduce) {
  .fog-veil { opacity: 0 !important; } /* no scrub → stay clear */
}


/* ---- grassland ---- */
.bg-grassland {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 460px;
}
@media (max-width: 640px) {
  .bg-grassland { height: 200px; }
}

/* ---- savanna hills (layered for depth) ----
   Three rolling ridges, each a flat-bottomed SVG stretched full width and
   anchored to the grassland floor. Depth comes from color-mix: the back ridge
   is the faintest tint of ink, the front the strongest, so they read as
   receding planes rather than one flat band. On-theme in day + night. */
.bg-hill {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  pointer-events: none;
}
.bg-hill path { transition: fill 1.2s ease; }
.savanna-hill-back  { fill: color-mix(in srgb, var(--text) 8%,  var(--bg)); }
.savanna-hill-mid   { fill: color-mix(in srgb, var(--text) 15%, var(--bg)); }
.savanna-hill-front { fill: color-mix(in srgb, var(--text) 24%, var(--bg)); }
.bg-hill-back  { height: 360px; }
.bg-hill-mid   { height: 290px; }
.bg-hill-front { height: 210px; }
@media (max-width: 640px) {
  .bg-hill-back  { height: 156px; }
  .bg-hill-mid   { height: 125px; }
  .bg-hill-front { height: 92px; }
}

/* ---- fireflies (night) ---- */
.bg-fireflies {
  position: absolute;
  inset: 0;
  /* Was revealed by the .dark class. With dark mode gone that selector can
     never match, and the only thing that renders these is the /background
     preview route, so they're simply on there. */
  opacity: 1;
  transition: opacity 0.9s ease 0.7s;
  pointer-events: none;
}
.bg-firefly {
  position: absolute;
  width: var(--size, 5px);
  height: var(--size, 5px);
  border-radius: 50%;
  /* white-hot core fading to amber → a glowing bug, not a flat dot */
  background: radial-gradient(circle at 50% 45%, #fff6dc 0%, #f3d266 45%, rgba(230, 196, 92, 0) 72%);
  /* layered halo = real bloom */
  box-shadow:
    0 0 6px 2px rgba(246, 216, 120, 0.9),
    0 0 14px 5px rgba(230, 196, 92, 0.5),
    0 0 28px 9px rgba(230, 196, 92, 0.22);
  will-change: transform, opacity;
  animation:
    bgw-fireflyFloat var(--dur) ease-in-out infinite,
    bgw-fireflyPulse calc(var(--dur) * 0.55) ease-in-out infinite;
  animation-delay: var(--delay);
}
/* the brighter few — a wider, hotter glow that anchors the swarm */
.bg-firefly-bright {
  box-shadow:
    0 0 8px 3px rgba(255, 238, 170, 0.95),
    0 0 20px 7px rgba(240, 206, 100, 0.6),
    0 0 40px 14px rgba(230, 196, 92, 0.3);
}

/* ---- savanna silhouettes ---- */
/* Each silhouette SVG is used as a MASK over a var(--text) fill, so every animal
   and tree takes the font color and flips charcoal<->pastel with the theme,
   keeping the footer in harmony with the text. The SVG's own (baked) color is
   irrelevant — only its shape matters as the mask. */
.bg-animal { position: absolute; }
.bg-animal .pose {
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
}
.bg-flip .pose { transform: scaleX(-1); }
.pose-mask {
  background-color: var(--text);
  -webkit-mask-image: var(--sil);
          mask-image: var(--sil);
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center bottom;
          mask-position: center bottom;
  -webkit-mask-size: contain;
          mask-size: contain;
  transition: background-color 0.6s ease;
}
/* heights live here (the aspect-ratio is set inline per shape from its viewBox)
   so width resolves correctly without intrinsic-image sizing. */
.bg-animal .pose { width: auto; height: auto; max-width: none; }
.bg-elephant      { left: 13%; bottom: 26px; }
.bg-elephant .pose      { height: 82px; }
.bg-elephant-baby { left: 25%; bottom: 24px; }
.bg-elephant-baby .pose { height: 44px; }
.bg-antelope      { left: 45%; bottom: 30px; }
.bg-antelope .pose      { height: 52px; }
.bg-antelope-2    { left: 52%; bottom: 32px; }
.bg-antelope-2 .pose    { height: 42px; }
.bg-giraffe       { left: 70%; bottom: 30px; }
.bg-giraffe .pose       { height: 138px; }
.bg-acacia-1 { left: 84%; bottom: 22px; }
.bg-acacia-1 .pose { height: 188px; }
.bg-acacia-2 { left: 5%;  bottom: 34px; }
.bg-acacia-2 .pose { height: 150px; }

/* Mobile — thin the herd (drop the baby elephant + second antelope), shrink the
   survivors, and spread them across the narrow stage so nothing piles up. */
@media (max-width: 640px) {
  .bg-elephant-baby,
  .bg-antelope-2 { display: none; }
  .bg-acacia-2 { left: 2%;  bottom: 16px; }
  .bg-acacia-2 .pose { height: 104px; }
  .bg-elephant { left: 17%; bottom: 12px; }
  .bg-elephant .pose { height: 54px; }
  .bg-antelope { left: 46%; bottom: 14px; }
  .bg-antelope .pose { height: 36px; }
  .bg-giraffe { left: 64%; bottom: 14px; }
  .bg-giraffe .pose { height: 92px; }
  .bg-acacia-1 { left: 85%; bottom: 10px; }
  .bg-acacia-1 .pose { height: 118px; }
}

@keyframes bgw-fireflyFloat {
  0%   { transform: translate(0, 0) scale(0.85); }
  25%  { transform: translate(calc(var(--sway) * 1px), calc(var(--rise) * -0.5px)) scale(1); }
  50%  { transform: translate(0, calc(var(--rise) * -1px)) scale(1.08); }
  75%  { transform: translate(calc(var(--sway) * -1px), calc(var(--rise) * -0.5px)) scale(0.96); }
  100% { transform: translate(0, 0) scale(0.85); }
}
/* asymmetric peak = a flicker, not a smooth breathe → shimmer */
@keyframes bgw-fireflyPulse {
  0%, 100% { opacity: 0.12; }
  45%      { opacity: 1; }
  60%      { opacity: 0.82; }
}
`;

/* ---- SVG pieces (hand-drawn, wobbly paths) ---- */



/* ---- exported pieces ---- */

export function BackgroundStyles() {
  return <style>{CSS}</style>;
}

export function SkyScene() {
  // Just the sky colour that content scrolls over (oat by day, warm midnight by
  // night, via `.bg-sky`). The drifting clouds and stars were removed along with
  // the footer scenery.
  return <div className="bg-sky" />;
}

/**
 * FogReveal — the atmospheric-haze transition between <main> and the curtain
 * footer. No literal clouds. Renders an invisible sentinel at the bottom of
 * main's content plus a fixed paper-toned fog veil (.fog-veil) painted behind
 * the page content but above the fixed footer. A scrubbed ScrollTrigger fades
 * the veil IN then back OUT across the seam, so the footer surfaces out of a
 * paper fog (with a touch of backdrop blur) that builds then dissipates.
 *
 * Honors prefers-reduced-motion (veil stays clear; footer reveals via normal
 * scroll). SiteFrame remounts this per route (key={path}) so the trigger
 * geometry is rebuilt fresh after client-side navigation.
 */
export function FogReveal() {
  const sentinel = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Fog builds as the footer starts to show, then clears as it fully reveals.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: sentinel.current,
          start: "top bottom", // seam enters the viewport → fog begins
          end: "top top", // seam reaches the top → footer fully out of fog
          scrub: true,
        },
      })
      .fromTo(veil.current, { opacity: 0 }, { opacity: 0.92, ease: "none" })
      .to(veil.current, { opacity: 0, ease: "none" });
  });

  return (
    <>
      <div ref={sentinel} className="fog-sentinel" aria-hidden />
      <div ref={veil} className="fog-veil" aria-hidden />
    </>
  );
}

export function GrasslandScene() {
  return (
    <div className="bg-grassland">
      {/* Layered hills behind the herd — three receding ridges for depth.
          Rendered first so the animals + acacias paint in front of them. */}
      <svg className="bg-hill bg-hill-back" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden>
        <path className="savanna-hill-back" d="M0 200 L0 118 C260 70 520 78 760 108 C1000 138 1220 92 1440 116 L1440 200 Z" />
      </svg>
      <svg className="bg-hill bg-hill-mid" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden>
        <path className="savanna-hill-mid" d="M0 170 L0 104 C320 144 560 64 840 96 C1080 124 1290 84 1440 110 L1440 170 Z" />
      </svg>
      <svg className="bg-hill bg-hill-front" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden>
        <path className="savanna-hill-front" d="M0 140 L0 86 C380 116 640 58 980 84 C1210 102 1340 74 1440 88 L1440 140 Z" />
      </svg>

      <div className="bg-animal bg-acacia-1">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/acacia-day.svg)", aspectRatio: "124 / 129.6" }} />
      </div>
      <div className="bg-animal bg-acacia-2">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/acacia2-day.svg)", aspectRatio: "204 / 184" }} />
      </div>

      <div className="bg-animal bg-elephant bg-flip">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/elephant-day.svg)", aspectRatio: "229.9 / 151.4" }} />
      </div>
      <div className="bg-animal bg-elephant-baby bg-flip">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/elephant-baby-day.svg)", aspectRatio: "107.3 / 56.7" }} />
      </div>

      <div className="bg-animal bg-antelope">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/antelope-day.svg)", aspectRatio: "107.5 / 110.9" }} />
      </div>
      <div className="bg-animal bg-antelope-2">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/antelope2-day.svg)", aspectRatio: "86.2 / 56.7" }} />
      </div>

      <div className="bg-animal bg-giraffe">
        <span className="pose pose-mask" aria-hidden style={{ ["--sil" as string]: "url(/savanna/giraffe-day.svg)", aspectRatio: "176.2 / 216.2" }} />
      </div>

      <div className="bg-fireflies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className={f.bright ? "bg-firefly bg-firefly-bright" : "bg-firefly"}
            style={{
              left: `${f.x}%`,
              bottom: f.bottom,
              ["--dur" as string]: `${f.dur}s`,
              ["--delay" as string]: `${f.d}s`,
              ["--rise" as string]: f.rise,
              ["--sway" as string]: f.sway,
              ["--size" as string]: `${f.size}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Default export — the full scene in one fixed layer, used by the /background
// preview route. (Kept because the iCloud-synced project keeps resurrecting that
// route file; a present default export means it always compiles.)
export default function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, overflow: "hidden" }}>
      <BackgroundStyles />
      <SkyScene />
    <GrasslandScene />
    </div>
  );
}
