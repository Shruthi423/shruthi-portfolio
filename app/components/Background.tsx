"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/* ------------------------------------------------------------------ *
 * Background — an animated, hand-drawn illustrated world, split into
 * composable pieces so it can integrate with the real site:
 *   <BackgroundStyles />  — the shared <style> block (render once)
 *   <SkyScene />          — sky colour + clouds + birds + plane + stars
 *   <DayNightToggle />    — the day / night bat button (fixed, top-right)
 *   <GrasslandScene />    — hills + sheep + tree + fence + fireflies
 *   <Background />        — default: all of the above, for /background
 *
 * Day / night is keyed off the global `.dark` class (the theme), so the
 * sun/moon toggle drives the whole site's light/dark theme.
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

const FIREFLIES = [
  { x: 7, bottom: 44, d: 0, dur: 4.2, rise: 6 },
  { x: 19, bottom: 30, d: 1.3, dur: 5.1, rise: 5 },
  { x: 31, bottom: 56, d: 0.6, dur: 3.4, rise: 7 },
  { x: 44, bottom: 24, d: 2.1, dur: 4.8, rise: 4 },
  { x: 56, bottom: 50, d: 0.9, dur: 5.6, rise: 6 },
  { x: 68, bottom: 34, d: 1.7, dur: 3.8, rise: 5 },
  { x: 81, bottom: 58, d: 2.6, dur: 4.5, rise: 7 },
  { x: 92, bottom: 28, d: 0.4, dur: 5.3, rise: 5 },
  { x: 13, bottom: 62, d: 3.1, dur: 4.0, rise: 6 },
  { x: 26, bottom: 38, d: 0.2, dur: 5.8, rise: 4 },
  { x: 38, bottom: 70, d: 2.4, dur: 3.6, rise: 7 },
  { x: 50, bottom: 34, d: 1.0, dur: 4.9, rise: 5 },
  { x: 62, bottom: 64, d: 3.5, dur: 4.3, rise: 6 },
  { x: 74, bottom: 46, d: 0.8, dur: 5.4, rise: 5 },
  { x: 87, bottom: 68, d: 2.0, dur: 3.9, rise: 7 },
];

// Shooting stars — long cycles, brief streak; ~one every 8-12s (night only).
const SHOOTING = [
  { top: "11%", left: "9%", d: 1.5, dur: 16 },
  { top: "5%", left: "54%", d: 9, dur: 19 },
];

// Grass blades along the front hill's top edge — deterministic irregularity.
const BLADES = Array.from({ length: 46 }, (_, i) => ({
  x: i * 2.18 + (i % 3) * 0.55,
  h: 7 + (i % 4) * 2,
  tilt: ((i % 5) - 2) * 5,
}));

const CSS = `
/* ---- test-route container ---- */
.bg-root {
  position: fixed;
  inset: 0;
  z-index: 90;
  overflow: hidden;
}

/* ---- sky scene (fills whatever it's placed in) ---- */
.bg-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: #FFFAF2;
  transition: background-color 1.2s ease;
}
.dark .bg-sky { background-color: #171520; }

/* flat sky-coloured fill (used behind the footer) */
.bg-skyfill {
  position: absolute;
  inset: 0;
  background-color: #FFFAF2;
  transition: background-color 1.2s ease;
}
.dark .bg-skyfill { background-color: #171520; }

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
  color: #3b2a1c; /* espresso — matches the top-right icons, visible on light + sky */
  transition: transform 0.2s ease;
}
.bg-toggle:hover { transform: scale(1.08); }
/* moonlit oat at night so the bat stays visible on the dark home */
.dark .bg-toggle { color: #eae0ce; }
.bat-flip {
  display: block;
  opacity: 0.7;
  transform: rotate(180deg); /* day → upside-down (bat at rest) */
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  will-change: transform;
}
.dark .bat-flip { transform: rotate(0deg); } /* night → upright */
.bg-toggle:hover .bat-flip { opacity: 1; }
.bg-sun-rays { transform-origin: 50px 50px; animation: bgw-rayRotate 12s linear infinite; will-change: transform; }
.bg-moon-bob { animation: bgw-moonBob 4s ease-in-out infinite; will-change: transform; }

/* ---- clouds ---- */
/* wrapper owns the day/night fade so GSAP can freely drive each cloud's opacity */
.bg-clouds {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.8s ease;
}
.dark .bg-clouds { opacity: 0; }
.bg-cloud {
  position: absolute;
  will-change: transform, opacity;
  visibility: hidden; /* GSAP reveals via autoAlpha — avoids an SSR flash */
}
.bg-cloud svg { display: block; width: 100%; height: auto; }
.bg-cloud path { fill: #e9e3d4; }
.bg-cloud-1 { top: 13%; left: 1%;   width: 420px; }
.bg-cloud-2 { top: 30%; right: 3%;  width: 380px; }
.bg-cloud-3 { top: 52%; left: 11%;  width: 240px; }
.bg-cloud-4 { top: 6%;  right: 19%; width: 300px; }

/* ---- stars (night) ---- */
.bg-stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.9s ease 0.6s;
  pointer-events: none;
}
.dark .bg-stars { opacity: 1; }
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
  background: linear-gradient(to left, #ffffff, rgba(255, 255, 255, 0));
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
  background: #ffffff;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);
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
.bg-hill { position: absolute; left: 0; bottom: 0; width: 100%; }
.bg-grass-piece { position: absolute; bottom: 0; }

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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e6c45c;
  box-shadow: 0 0 8px 2px rgba(230, 196, 92, 0.85);
  will-change: transform, opacity;
  animation:
    bgw-fireflyFloat var(--dur) ease-in-out infinite,
    bgw-fireflyPulse calc(var(--dur) * 0.6) ease-in-out infinite;
  animation-delay: var(--delay);
}

/* ---- sheep (cross-fade poses by theme) ---- */
.bg-sheep { position: absolute; bottom: 34px; }
.bg-sheep .sheep-pose {
  position: absolute;
  bottom: 0;
  left: 0;
  transition: opacity 0.6s ease;
}
.sheep-awake  { opacity: 1; }
.sheep-asleep { opacity: 0; }
.dark .sheep-awake  { opacity: 0; }
.dark .sheep-asleep { opacity: 1; }
.bg-sheep-1 { left: 14%; }
.bg-sheep-1 .sheep-awake { animation: bgw-sheepWander 36s ease-in-out infinite; will-change: transform; }
.bg-sheep-2 { left: 62%; bottom: 30px; }

@keyframes bgw-rayRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes bgw-moonBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
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
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(calc(var(--rise) * -1px)); }
}
@keyframes bgw-fireflyPulse {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}
@keyframes bgw-sheepWander {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(110px); }
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
  dir,
  depth,
}: {
  shape: { viewBox: string; d: string };
  className: string;
  dir: "left" | "right";
  depth: number;
}) {
  return (
    <div className={className} data-cloud-dir={dir} data-cloud-depth={depth}>
      <svg viewBox={shape.viewBox} aria-hidden>
        <path d={shape.d} />
      </svg>
    </div>
  );
}

function StarShape({ size }: { size: number }) {
  if (size <= 3) {
    return <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#ffffff" />;
  }
  return (
    <path
      d="M5 0 C5.6 3 7 4.4 10 5 C7 5.6 5.6 7 5 10 C4.4 7 3 5.6 0 5 C3 4.4 4.4 3 5 0 Z"
      fill="#ffffff"
    />
  );
}

function HillBack() {
  return (
    <svg className="bg-hill" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden style={{ height: 320 }}>
      <path d="M0 160 L0 78 C240 28 470 22 720 52 C980 84 1210 38 1440 68 L1440 160 Z" fill="#9fae72" />
    </svg>
  );
}

function HillMid() {
  return (
    <svg className="bg-hill" viewBox="0 0 1440 130" preserveAspectRatio="none" aria-hidden style={{ height: 260 }}>
      <path d="M0 130 L0 72 C300 102 520 38 800 62 C1080 86 1270 48 1440 78 L1440 130 Z" fill="#79894c" />
    </svg>
  );
}

function HillFront() {
  return (
    <svg className="bg-hill" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden style={{ height: 192 }}>
      <path d="M0 100 L0 56 C360 72 600 44 920 58 C1180 70 1320 50 1440 60 L1440 100 Z" fill="#5b6a34" />
      <g stroke="#5b6a34" strokeWidth="2.5" strokeLinecap="round">
        {BLADES.map((b, i) => {
          const x = (b.x / 100) * 1440;
          const topY = 58 - (b.x % 7);
          return <path key={i} d={`M${x} ${topY} L${x + b.tilt * 0.4} ${topY - b.h}`} />;
        })}
      </g>
    </svg>
  );
}

function Fence() {
  return (
    <svg
      className="bg-grass-piece"
      width="190"
      height="80"
      viewBox="0 0 190 80"
      aria-hidden
      style={{ left: "26%", bottom: 30 }}
    >
      <g stroke="#6b4c2a" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M16 76 L14 20" />
        <path d="M70 75 L72 18" />
        <path d="M124 76 L122 21" />
        <path d="M178 74 L176 19" />
        <path d="M10 34 C60 30 130 32 184 30" />
        <path d="M10 56 C60 53 130 55 184 52" />
      </g>
    </svg>
  );
}

function Tree() {
  return (
    <svg
      className="bg-grass-piece"
      width="96"
      height="150"
      viewBox="0 0 96 150"
      aria-hidden
      style={{ left: "76%", bottom: 26 }}
    >
      <path
        d="M40 150 C39 120 36 100 38 78 C39 70 44 66 50 70 C54 73 53 95 52 118 C52 132 53 142 54 150 Z"
        fill="#3a4520"
      />
      <path
        d="M46 8 C70 4 92 22 88 44 C95 58 80 78 58 76 C40 82 14 70 12 48 C4 32 22 10 46 8 Z"
        fill="#4f6129"
      />
    </svg>
  );
}

function SheepAwake({ size }: { size: number }) {
  return (
    <svg className="sheep-pose sheep-awake" width={size} height={size * 0.85} viewBox="0 0 60 50" aria-hidden>
      <g stroke="#2d2a26" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 38 L19 48" />
        <path d="M34 39 L35 48" />
      </g>
      <path
        d="M14 30 C9 22 16 13 26 15 C31 8 46 9 49 19 C57 21 56 33 47 35 C44 41 24 41 20 35 C16 36 13 33 14 30 Z"
        fill="#fdf9f2"
      />
      <path d="M44 20 C50 19 53 24 50 29 C47 33 40 32 39 26 C39 22 41 21 44 20 Z" fill="#2d2a26" />
      <path d="M41 19 C38 16 35 19 38 22 Z" fill="#2d2a26" />
    </svg>
  );
}

function SheepAsleep({ size }: { size: number }) {
  return (
    <svg className="sheep-pose sheep-asleep" width={size} height={size * 0.85} viewBox="0 0 60 50" aria-hidden>
      <path
        d="M10 42 C6 35 14 30 24 31 C30 26 44 27 48 34 C56 35 56 44 47 45 C40 48 18 48 10 42 Z"
        fill="#fdf9f2"
      />
      <path d="M44 36 C50 35 52 41 48 44 C44 46 39 43 40 39 C40 37 42 36 44 36 Z" fill="#2d2a26" />
      <path
        d="M40 24 L46 24 L40 30 L46 30"
        stroke="#fdf9f2"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const sky = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const clouds = gsap.utils.toArray<HTMLElement>(".bg-cloud", sky.current!);

      clouds.forEach((cloud) => {
        const fromLeft = cloud.dataset.cloudDir === "left";
        const depth = Number(cloud.dataset.cloudDepth ?? 0.3);

        // enter from side → hold mid-frame → exit back the way it came.
        // Scrubbed timeline across one viewport of hero scroll; ratios = 30/40/30.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sky.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          })
          .fromTo(
            cloud,
            { xPercent: fromLeft ? -160 : 160, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: 3, ease: "none" },
          )
          .to(cloud, { duration: 4 }) // hold — empty tween acts as a pause
          .to(cloud, {
            xPercent: fromLeft ? -160 : 160,
            autoAlpha: 0,
            duration: 3,
            ease: "none",
          });

        // parallax — vertical drift over the whole page; depth sets the rate
        gsap.to(cloud, {
          yPercent: -depth * 120,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });
    },
    { scope: sky },
  );

  return (
    <div className="bg-sky" ref={sky}>
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

      {/* clouds (hidden at night) */}
      <div className="bg-clouds">
        <Cloud shape={CLOUD_SHAPES[0]} className="bg-cloud bg-cloud-1" dir="left" depth={0.18} />
        <Cloud shape={CLOUD_SHAPES[1]} className="bg-cloud bg-cloud-2" dir="right" depth={0.5} />
        <Cloud shape={CLOUD_SHAPES[2]} className="bg-cloud bg-cloud-3" dir="left" depth={0.32} />
        <Cloud shape={CLOUD_SHAPES[3]} className="bg-cloud bg-cloud-4" dir="right" depth={0.4} />
      </div>

    </div>
  );
}

export function GrasslandScene() {
  return (
    <div className="bg-grassland">
      <HillBack />
      <HillMid />
      <HillFront />

      <Fence />
      <Tree />

      <div className="bg-sheep bg-sheep-1">
        <SheepAwake size={44} />
        <SheepAsleep size={44} />
      </div>
      <div className="bg-sheep bg-sheep-2">
        <SheepAwake size={34} />
        <SheepAsleep size={34} />
      </div>

      <div className="bg-fireflies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="bg-firefly"
            style={{
              left: `${f.x}%`,
              bottom: f.bottom,
              ["--dur" as string]: `${f.dur}s`,
              ["--delay" as string]: `${f.d}s`,
              ["--rise" as string]: f.rise,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Background() {
  return (
    <div className="bg-root">
      <BackgroundStyles />
      <SkyScene />
      <DayNightToggle />
      <GrasslandScene />
    </div>
  );
}
