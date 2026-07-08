"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

/* ------------------------------------------------------------------ *
 * Background — an animated, hand-drawn illustrated world, split into
 * composable pieces so it can integrate with the real site:
 *   <BackgroundStyles />  — the shared <style> block (render once)
 *   <SkyScene />          — the flat sky-colour backdrop content scrolls over
 *   <DayNightToggle />    — the day / night bat button (fixed, top-right)
 *   <GrasslandScene />    — savanna hills, animals + fireflies (the /background
 *                           preview route only; the footer has no scenery)
 *   <FogReveal />         — the paper-fog main → footer scroll transition
 *
 * Day / night is keyed off the global `.dark` class (the theme), so the
 * bat toggle drives the whole site's light/dark theme.
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
  background-color: var(--paper);
  transition: background-color 1.2s ease;
}

/* ---- sun / moon toggle ---- */
.bg-toggle {
  position: fixed;
  top: 0;
  right: 32px;
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink); /* the ink — charcoal on light paper, the pastel at night */
  transition: transform 0.2s ease, color 0.6s ease;
}
.bg-toggle:hover { transform: scale(1.08); }
/* Over the home's inverted hero panel the page ink IS the background, so flip
   the bat to the paper colour to keep it visible (class toggled on <html>). */
.hero-active .bg-toggle { color: var(--paper); }
/* keep the bat quiet — smaller than its 64px hit-area, smaller still on mobile */
.bg-toggle svg { width: 32px; height: 32px; }
@media (max-width: 640px) {
  .bg-toggle { width: 48px; height: 48px; right: 18px; }
  .bg-toggle svg { width: 24px; height: 24px; }
}
.bat-flip {
  display: block;
  opacity: 0.7;
  transform: rotate(180deg); /* day → upside-down (bat at rest) */
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  will-change: transform;
}
.dark .bat-flip { transform: rotate(0deg); } /* night → upright */
.bg-toggle:hover .bat-flip,
.bat-btn:hover .bat-flip { opacity: 1; }

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
    var(--paper) 0%,
    var(--paper) 34%,
    color-mix(in srgb, var(--paper) 58%, transparent) 68%,
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
.savanna-hill-back  { fill: color-mix(in srgb, var(--ink) 8%,  var(--paper)); }
.savanna-hill-mid   { fill: color-mix(in srgb, var(--ink) 15%, var(--paper)); }
.savanna-hill-front { fill: color-mix(in srgb, var(--ink) 24%, var(--paper)); }
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
  opacity: 0;
  transition: opacity 0.9s ease 0.7s;
  pointer-events: none;
}
.dark .bg-fireflies { opacity: 1; }
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
/* Each silhouette SVG is used as a MASK over a var(--ink) fill, so every animal
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
  background-color: var(--ink);
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
/* ---- bat toggle (day: upside-down · night: upright · wings flap on hover) ---- */
.bat-wing-l { transform-box: view-box; transform-origin: 41px 40px; }
.bat-wing-r { transform-box: view-box; transform-origin: 59px 40px; }
.bg-toggle:hover .bat-wing-l,
.bat-btn:hover .bat-wing-l { animation: bgw-batFlapL 0.5s ease-in-out infinite; }
.bg-toggle:hover .bat-wing-r,
.bat-btn:hover .bat-wing-r { animation: bgw-batFlapR 0.5s ease-in-out infinite; }
@keyframes bgw-batFlapL {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(-8deg); }
}
@keyframes bgw-batFlapR {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(8deg); }
}
@media (prefers-reduced-motion: reduce) {
  .bat-flip { transition: none; }
  .bat-wing-l, .bat-wing-r { animation: none; }
}
`;

/* ---- SVG pieces (hand-drawn, wobbly paths) ---- */

// The bat — your exact silhouette, split into wings so they can flap on hover.
function BatIcon({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden>
      {/* left wing */}
      <g className="bat-wing-l">
        <path d="M41.34 41.18 L32.42 30.32 H9.60 C13.72 33.88 19.58 40.82 19.00 51.22 C24.76 50.89 42.14 51.51 50.00 69.68 L41.34 41.18 Z" />
      </g>
      {/* right wing */}
      <g className="bat-wing-r">
        <path d="M58.66 41.18 L67.58 30.32 H90.40 C86.28 33.88 80.42 40.82 81.00 51.22 C75.24 50.89 57.86 51.51 50.00 69.68 L58.66 41.18 Z" />
      </g>
      {/* body + ears (drawn on top — hides the wing roots while they flap) */}
      <path d="M48.86 35.46 L44.00 29.96 V40.23 C44.00 40.86 43.60 41.43 43.01 41.64 C42.42 41.85 41.75 41.67 41.34 41.18 L50.00 69.68 L58.66 41.18 C58.26 41.67 57.59 41.85 56.99 41.64 C56.40 41.43 56.00 40.87 56.00 40.23 V29.96 L51.12 35.45 C50.45 36.02 49.55 36.02 48.86 35.46 Z" />
    </svg>
  );
}


/* ---- exported pieces ---- */

export function BackgroundStyles() {
  return <style>{CSS}</style>;
}

export function DayNightToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const path = usePathname();

  useEffect(() => setMounted(true), []);

  const isDay = resolvedTheme !== "dark";

  // The one-pager home moves light/dark into its footer control, so hide the
  // global bat there.
  if (path === "/") return null;

  return (
    <button
      type="button"
      className="bg-toggle"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={
        mounted
          ? isDay
            ? "Switch to night mode"
            : "Switch to day mode"
          : "Toggle day and night"
      }
    >
      <span className="bat-flip">
        <BatIcon />
      </span>
    </button>
  );
}

// Footer-sized light/dark toggle: the same bat, sized to sit inline with the
// colour swatch + footprint picker in the footer's control cluster. Reuses the
// globally-injected bat CSS (.bat-flip hangs upside-down by day, upright at
// night; wings flap on hover via the .bat-btn selectors below).
export function BatToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={`bat-btn flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${className}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      data-cursor-label={isDark ? "Day" : "Night"}
      // Same frame as the footprint + colour triggers: 32px circle, 2px inset
      // ring, glyph sized like the footprint paw so all three read one size.
      style={{ boxShadow: "inset 0 0 0 2px currentColor" }}
    >
      <span className="bat-flip">
        <BatIcon size={22} />
      </span>
    </button>
  );
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
      <DayNightToggle />
      <GrasslandScene />
    </div>
  );
}
