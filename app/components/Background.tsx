"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/* ------------------------------------------------------------------ *
 * Background — an animated, hand-drawn illustrated world, split into
 * composable pieces so it can integrate with the real site:
 *   <BackgroundStyles />  — the shared <style> block (render once)
 *   <SkyScene />          — the flat sky-colour backdrop content scrolls over
 *   <DayNightToggle />    — the day / night bat button (fixed, top-right)
 *   <Clouds /> <NightSky /> <GrasslandScene /> — the footer's backdrop
 *                           (drifting clouds, stars, savanna animals + fireflies)
 *   <FogReveal />         — the paper-fog main → footer scroll transition
 *
 * Day / night is keyed off the global `.dark` class (the theme), so the
 * bat toggle drives the whole site's light/dark theme.
 * ------------------------------------------------------------------ */

// Static, deterministic scatter data (no Math.random — SSR-safe).
const STARS = [
  { x: 6, y: 10, size: 3, star: false, d: 0.2, dur: 3.1 },
  { x: 13, y: 26, size: 9, star: true, d: 1.4, dur: 4.2 },
  { x: 19, y: 8, size: 3, star: false, d: 2.7, dur: 2.6 },
  { x: 24, y: 40, size: 3, star: false, d: 0.9, dur: 3.6 },
  { x: 30, y: 16, size: 8, star: true, d: 3.3, dur: 3.9 },
  { x: 36, y: 33, size: 3, star: false, d: 1.1, dur: 2.9 },
  { x: 41, y: 6, size: 3, star: false, d: 2.2, dur: 3.4 },
  { x: 47, y: 22, size: 9, star: true, d: 0.5, dur: 4.4 },
  { x: 52, y: 44, size: 3, star: false, d: 3.8, dur: 2.7 },
  { x: 57, y: 12, size: 3, star: false, d: 1.7, dur: 3.2 },
  { x: 62, y: 30, size: 8, star: true, d: 2.9, dur: 4.0 },
  { x: 67, y: 5, size: 3, star: false, d: 0.7, dur: 2.5 },
  { x: 71, y: 38, size: 3, star: false, d: 3.1, dur: 3.7 },
  { x: 75, y: 18, size: 9, star: true, d: 1.9, dur: 4.3 },
  { x: 80, y: 9, size: 3, star: false, d: 2.4, dur: 2.8 },
  { x: 84, y: 34, size: 3, star: false, d: 0.3, dur: 3.5 },
  { x: 88, y: 22, size: 8, star: true, d: 3.6, dur: 3.8 },
  { x: 92, y: 13, size: 3, star: false, d: 1.3, dur: 3.0 },
  { x: 95, y: 41, size: 3, star: false, d: 2.6, dur: 2.6 },
  { x: 9, y: 46, size: 3, star: false, d: 3.4, dur: 3.3 },
  { x: 44, y: 52, size: 8, star: true, d: 0.6, dur: 4.1 },
  { x: 33, y: 60, size: 3, star: false, d: 2.0, dur: 2.9 },
  { x: 72, y: 55, size: 3, star: false, d: 1.5, dur: 3.6 },
];

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

// Shooting stars — long cycles, brief streak; ~one every 8-12s (night only).
const SHOOTING = [
  { top: "11%", left: "9%", d: 1.5, dur: 16 },
  { top: "5%", left: "54%", d: 9, dur: 19 },
];

const CSS = `
/* ---- sky scene (fills whatever it's placed in) ---- */
.bg-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: var(--paper);
  transition: background-color 1.2s ease;
}

/* flat sky-coloured fill (used behind the footer) — the chosen paper */
.bg-skyfill {
  position: absolute;
  inset: 0;
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
.bg-toggle:hover .bat-flip { opacity: 1; }

/* ---- clouds ---- */
.bg-clouds {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden; /* clip clouds that extend past the footer edges */
}
.bg-cloud { position: absolute; }
.bg-cloud svg { display: block; width: 100%; height: auto; overflow: visible; }
/* soft filled clouds (the live look) — a faint tint of ink over the paper, no
   stroke. Always in harmony with the chosen hue in either polarity. */
.bg-cloud path {
  fill: color-mix(in srgb, var(--ink) 10%, var(--paper));
}
/* a single horizon line across the footer — clouds overlap to read as one band.
   Each drifts very slowly + a touch out of phase (alternating direction) for a
   calm, living parallax. Tunable per cloud via --cdur / --cdelay / --cdrift. */
.bg-cloud {
  animation: bgw-cloudDrift var(--cdur, 30s) ease-in-out var(--cdelay, 0s) infinite alternate;
}
.bg-cloud-1 { top: 43%; left: -6%; width: 420px; --cdur: 34s; --cdelay: 0s;   --cdrift: 26px;  --cdriftY: -5px; }
.bg-cloud-2 { top: 40%; left: 20%; width: 380px; --cdur: 27s; --cdelay: 1.5s; --cdrift: -20px; --cdriftY: 4px; }
.bg-cloud-3 { top: 44%; left: 48%; width: 240px; --cdur: 39s; --cdelay: 0.8s; --cdrift: 22px;  --cdriftY: -3px; }
.bg-cloud-4 { top: 41%; left: 72%; width: 300px; --cdur: 31s; --cdelay: 2.2s; --cdrift: -24px; --cdriftY: 5px; }

@keyframes bgw-cloudDrift {
  from { transform: translate(0, 0); }
  to   { transform: translate(var(--cdrift, 22px), var(--cdriftY, 0)); }
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

/* ---- stars (night) ---- */
.bg-stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.9s ease 0.6s;
  pointer-events: none;
}
.dark .bg-stars { opacity: 1; color: var(--ink); }
.bg-star {
  position: absolute;
  animation: bgw-twinkle var(--dur) ease-in-out infinite;
  animation-delay: var(--delay);
  will-change: opacity;
}

/* ---- shooting stars (night, hero area) ---- */
.bg-shooting {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.9s ease 0.6s;
}
.dark .bg-shooting { opacity: 1; }
.bg-shoot {
  position: absolute;
  width: 90px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(to left, var(--ink), transparent);
  will-change: transform, opacity;
  animation: bgw-shoot var(--dur) ease-in infinite;
  animation-delay: var(--delay);
}
.bg-shoot::after {
  content: "";
  position: absolute;
  right: -1px;
  top: -1.5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ink);
  box-shadow: 0 0 8px 2px color-mix(in srgb, var(--ink) 75%, transparent);
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

@keyframes bgw-twinkle {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
@keyframes bgw-shoot {
  0%   { transform: translate(0, 0) rotate(32deg); opacity: 0; }
  2%   { opacity: 1; }
  9%   { transform: translate(340px, 210px) rotate(32deg); opacity: 1; }
  11%  { transform: translate(380px, 235px) rotate(32deg); opacity: 0; }
  100% { transform: translate(380px, 235px) rotate(32deg); opacity: 0; }
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
.bg-toggle:hover .bat-wing-l { animation: bgw-batFlapL 0.5s ease-in-out infinite; }
.bg-toggle:hover .bat-wing-r { animation: bgw-batFlapR 0.5s ease-in-out infinite; }
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
function BatIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 100 100" fill="currentColor" aria-hidden>
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

/* Cloud silhouettes lifted from the source art — each framed to its own
 * bounding box so it can be sized and placed independently. */
const CLOUD_SHAPES = [
  // long, low, sleek
  {
    viewBox: "228.9 44.5 230.6 46.2",
    d: "M459.522,90.735c-0.45-7.983-7.047-14.324-15.143-14.324c-2.257,0-4.392,0.506-6.318,1.389c-3.359-14.867-16.64-25.973-32.522-25.973c-16.222,0-29.734,11.584-32.728,26.931c-2.343-1.479-5.11-2.347-8.085-2.347c-3.059,0-5.901,0.912-8.285,2.468c-2.665-5.74-8.321-9.789-14.973-10.157c-3.973-13.978-16.824-24.22-32.075-24.22c-15.332,0-28.239,10.349-32.138,24.441c-0.697-0.071-1.404-0.107-2.12-0.107c-9.036,0-16.702,5.784-19.553,13.844c-2.786-3.309-6.954-5.415-11.617-5.415c-7.806,0-14.229,5.892-15.083,13.47H459.522z",
  },
  // big, bulky
  {
    viewBox: "47.0 397.7 216.7 53.9",
    d: "M263.715,451.596c-2.323-12.568-13.332-22.09-26.572-22.09c-5.609,0-10.819,1.709-15.138,4.634c-3.351-7.415-10.795-12.584-19.46-12.584c-9.032,0-16.737,5.613-19.862,13.535c-4.868-5.193-11.76-8.461-19.419-8.544c-5.585-16.761-21.39-28.851-40.028-28.851c-19.177,0-35.356,12.798-40.487,30.316c-2.759-0.95-5.717-1.473-8.799-1.473c-14.264,0-25.939,11.051-26.951,25.057H263.715z",
  },
  // small, puffy
  {
    viewBox: "42.8 301.6 119.1 49.5",
    d: "M161.94,351.073c-1.142-4.148-4.903-7.212-9.413-7.212c-1.745,0-3.36,0.494-4.78,1.294c-0.801-7.368-6.842-13.145-14.32-13.561c0.009-0.294,0.044-0.581,0.044-0.877c0-16.107-13.057-29.164-29.165-29.164c-16.107,0-29.164,13.057-29.164,29.164c0,0.493,0.05,0.973,0.074,1.46c-1.367-0.402-2.81-0.627-4.307-0.627c-7.179,0-13.184,4.96-14.817,11.635c-1.115-0.441-2.322-0.701-3.594-0.701c-4.998,0-9.077,3.754-9.681,8.589H161.94z",
  },
  // medium, chunky
  {
    viewBox: "290.2 240.5 143.1 51.8",
    d: "M432.9,292.252c0.231-0.908,0.367-1.855,0.367-2.835c0-6.352-5.15-11.502-11.502-11.502c-1.27,0-2.487,0.214-3.629,0.594c-1.879-7.014-8.261-12.186-15.867-12.186c-4.034,0-7.724,1.458-10.585,3.869c-2.014-6.805-8.303-11.773-15.761-11.773c-1.381,0-2.715,0.189-3.997,0.51c-3.028-10.651-12.821-18.454-24.442-18.454c-14.037,0-25.416,11.379-25.416,25.416c0,1.096,0.077,2.173,0.212,3.232c-0.725-0.098-1.459-0.166-2.21-0.166c-8.791,0-15.95,6.904-16.4,15.583c-0.727-0.138-1.475-0.217-2.242-0.217c-5.194,0-9.605,3.309-11.271,7.929H432.9z",
  },
] as const;

function Cloud({
  shape,
  className,
}: {
  shape: { viewBox: string; d: string };
  className: string;
}) {
  return (
    <div className={className}>
      <svg viewBox={shape.viewBox} aria-hidden>
        <path d={shape.d} />
      </svg>
    </div>
  );
}

function StarShape({ size }: { size: number }) {
  // currentColor so stars take the ink (the chosen pastel) at night.
  if (size <= 3) {
    return <circle cx={size / 2} cy={size / 2} r={size / 2} fill="currentColor" />;
  }
  return (
    <path
      d="M5 0 C5.6 3 7 4.4 10 5 C7 5.6 5.6 7 5 10 C4.4 7 3 5.6 0 5 C3 4.4 4.4 3 5 0 Z"
      fill="currentColor"
    />
  );
}



/* ---- exported pieces ---- */

export function BackgroundStyles() {
  return <style>{CSS}</style>;
}

export function DayNightToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDay = resolvedTheme !== "dark";

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

export function SkyScene() {
  // Clouds → <Clouds /> and stars/shooting stars → <NightSky />, both now live
  // in the Footer. This backdrop is just the sky colour that content scrolls
  // over (oat by day, warm midnight by night, via `.bg-sky`).
  return <div className="bg-sky" />;
}

/**
 * NightSky — the stars + shooting stars, extracted from SkyScene so they can
 * live in the Footer (mirrors how <Clouds /> was relocated). Pure CSS
 * animations (twinkle + shoot); they reveal only in dark mode via the
 * `.dark .bg-stars` / `.dark .bg-shooting` rules — the night counterpart to
 * the day-only clouds.
 */
export function NightSky() {
  return (
    <>
      {/* stars (night) */}
      <div className="bg-stars">
        {STARS.map((s, i) => (
          <svg
            key={i}
            className="bg-star"
            width={s.size}
            height={s.size}
            viewBox={s.star ? "0 0 10 10" : `0 0 ${s.size} ${s.size}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              ["--dur" as string]: `${s.dur}s`,
              ["--delay" as string]: `${s.d}s`,
            }}
            aria-hidden
          >
            <StarShape size={s.size} />
          </svg>
        ))}
      </div>

      {/* shooting stars (night) */}
      <div className="bg-shooting">
        {SHOOTING.map((s, i) => (
          <span
            key={i}
            className="bg-shoot"
            style={{
              top: s.top,
              left: s.left,
              ["--dur" as string]: `${s.dur}s`,
              ["--delay" as string]: `${s.d}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Clouds — extracted from SkyScene so they can live in the Footer.
 *
 * Animation: a continuous, time-based horizontal drift loop per cloud.
 * Each one floats from one edge to the other and resets, infinitely.
 * Shallower clouds (lower depth) drift slowly, deeper clouds drift faster —
 * a soft parallax that suggests depth without being scroll-bound.
 *
 * (The previous behaviour was a GSAP ScrollTrigger scrubbed timeline:
 * enter-from-side → hold → exit, plus a vertical parallax. That only made
 * sense over a scrolling viewport. The footer is fixed-bottom and doesn't
 * scroll, so the same trigger logic wouldn't fire — drift loop fits better.)
 */
export function Clouds() {
  // Lined chalk clouds forming the footer's horizon band. Bodies are paper-fill
  // so they occlude what's behind them; each drifts very slowly (see the
  // .bg-cloud / bgw-cloudDrift CSS) for a calm, living parallax.
  return (
    <div className="bg-clouds" aria-hidden>
      <Cloud shape={CLOUD_SHAPES[0]} className="bg-cloud bg-cloud-1" />
      <Cloud shape={CLOUD_SHAPES[1]} className="bg-cloud bg-cloud-2" />
      <Cloud shape={CLOUD_SHAPES[2]} className="bg-cloud bg-cloud-3" />
      <Cloud shape={CLOUD_SHAPES[3]} className="bg-cloud bg-cloud-4" />
    </div>
  );
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
