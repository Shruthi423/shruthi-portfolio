"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { gsap } from "@/app/lib/gsap";
import { useFootprint } from "@/app/components/shared/FootprintProvider";
import {
  FOOTPRINT_ANIMALS,
  FOOTER_HUES,
  SURFACE,
  HUES,
  BLENDS,
  SHAPES,
  type FootprintAnimal,
} from "@/app/lib/footprints";

// hex → "r,g,b" so the canvas can build rgba() veils/tints from a flat hex.
const rgbTriplet = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h,
    16,
  );
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

// hex → [r, g, b], for the footer's colour drift: it interpolates channels
// rather than tweening a string, so the canvas veil and the CSS panel are
// always built from the exact same numbers.
const rgbChannels = (hex: string): [number, number, number] => {
  const t = rgbTriplet(hex).split(", ").map(Number);
  return [t[0], t[1], t[2]];
};

// How long one hue holds, and how long it takes to become the next.
const FOOTER_HUE_HOLD = 10;
const FOOTER_HUE_FADE = 2.4;

// The frost veil is drawn on a 2D canvas and the prints are SVG, so both need
// real color values (not CSS vars) — hence the plain objects below.

// Five characterful tracks, one per picker slot. The animal picks the shape;
// the color is a random multi-hue blend, not a per-animal hue. Which one is
// chosen is shared, persisted site state — see FootprintProvider.
const ANIMALS = FOOTPRINT_ANIMALS;
type Animal = FootprintAnimal;

// The shapes are drawn for a 0 0 100 110 box. The stipple filter bleeds past
// that, so the rendered viewBox is padded and the size scaled to match — the
// paw lands at the same on-screen size, with room for its ragged edge.
const VB = { x: -14, y: -14, w: 128, h: 138 };
const PAW_W = 102;
const PAW_H = 110;
// Gradient sweep radius in user units, measured from the shape's center.
const GRAD_R = 78;

// Live two-tone palette for the SURFACE only — the frost veil and the chrome
// that sits on it (text, picker icons). The prints no longer read from this;
// they're mixed from HUES/BLENDS. `bg` is the paper; `fog` is it at veil alpha.
type Palette = {
  bg: string;
  fog: string;
  ink: string;
  pickerActive: string; // active picker chip tint (ink, low alpha)
};

const SIZE: Record<Animal, number> = {
  lion: 1.0,
  giraffe: 1.2,
  duck: 1.0,
  hippo: 1.45,
  zebra: 0.95,
};

const POOL = 44;
// Two more, smaller pools, both for the walkers that cross the headline. Only
// ever one crossing's worth is alive at once, so neither needs the full 44.
//
// POOL_SOFT is the passing mass: the same print again, lifted above the frost
// and blurred wide, so the crossing reads as one low-frequency form rather
// than fourteen separate scuffs. POOL_OVER is the copy on top of the type in
// `screen`, which is what actually tints the letters.
const POOL_SOFT = 18;
const POOL_OVER = 18;
// The crossing's soft copy: how far it blurs, and how much of the base print's
// opacity it carries.
const SOFT_BLUR = 9;
const SOFT_ALPHA = 0.7;
// The crossing breathes rather than snaps: it fades up over this, holds, and
// ebbs away, against the 0.18s pop a cursor print still uses. This is most of
// what "smoother" turned out to mean.
const SOFT_IN = 1.1;
const SOFT_HOLD = 1.3;
const SOFT_OUT = 1.8;
// Realistic-ish gait: stride (px between steps) + track width per animal.
const STRIDE: Record<Animal, number> = {
  giraffe: 146,
  lion: 108,
  duck: 72,
  hippo: 150,
  zebra: 96,
};
const FOOTW: Record<Animal, number> = {
  giraffe: 18,
  lion: 14,
  duck: 11,
  hippo: 20,
  zebra: 14,
};
const SPEED_MAX = 2.0; // px/ms above which a step reads as "light"
const WIPE_R = 85;
const REFOG_MS = 1700;
const WIPE_MIN = 14; // min cursor travel between fog wipes
const QUIET_FADE = 110; // px band around the menu where prints/wipes ramp down
const QUIET_PAD = 40; // padding around the link box that stays calm
// Minimum pocket so tiny chrome (wordmark, icons) gets the same calm as the links.
const QUIET_MIN_HW = 95; // min half-width
const QUIET_MIN_HH = 55; // min half-height

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const rectDist = (
  x: number,
  y: number,
  b: { left: number; top: number; right: number; bottom: number },
) => {
  const dx = Math.max(b.left - x, 0, x - b.right);
  const dy = Math.max(b.top - y, 0, y - b.bottom);
  return Math.hypot(dx, dy);
};

type Wipe = { x: number; y: number; s: number; r: number };

// Track shapes — shared by the cursor prints, the picker icons and the favicon,
// so the geometry has exactly one home (app/lib/footprints). The markup is our
// own static string, hence the safe dangerouslySetInnerHTML.
function ShapeGroup({
  animal,
  ...rest
}: { animal: Animal } & React.SVGProps<SVGGElement>) {
  return <g {...rest} dangerouslySetInnerHTML={{ __html: SHAPES[animal] }} />;
}

// Re-roll a slot's colorway before it's shown: a fresh three-hue blend, a fresh
// sweep angle, and a fresh turbulence seed so no two prints stipple alike.
//
// `tint` biases that roll. The hero passes the hue its rotating verb is
// currently wearing, so the trail turns over with the word instead of the two
// running as unrelated random systems. Only the blends that already contain
// the hue are eligible, and the tuple is rotated so the hue lands on the
// middle stop — the one carrying the most visual mass. A tint the palette
// doesn't know (or none at all, which is what charcoal means here) falls
// straight back to the full set.
function paintPrint(el: HTMLElement, tint?: string | null) {
  const tinted = tint ? BLENDS.filter((b) => b.includes(tint)) : [];
  const pool = tinted.length ? tinted : BLENDS;
  const picked = pool[(Math.random() * pool.length) | 0];
  const at = tinted.length ? picked.indexOf(tint as string) : 0;
  // Rotate so the tint sits at index 1 (the middle stop).
  const [c0, c1, c2] = [
    picked[(at + 2) % 3],
    picked[at],
    picked[(at + 1) % 3],
  ];
  const stops = el.querySelectorAll<SVGStopElement>("stop");
  stops[0]?.setAttribute("stop-color", c0);
  stops[1]?.setAttribute("stop-color", c1);
  stops[2]?.setAttribute("stop-color", c2);
  // Nudge the middle stop so the two bleeds are never evenly split.
  stops[1]?.setAttribute("offset", `${Math.round(rand(34, 66))}%`);

  const a = rand(0, Math.PI * 2);
  const dx = Math.cos(a) * GRAD_R;
  const dy = Math.sin(a) * GRAD_R;
  const grad = el.querySelector("linearGradient");
  if (grad) {
    grad.setAttribute("x1", `${50 - dx}`);
    grad.setAttribute("y1", `${55 - dy}`);
    grad.setAttribute("x2", `${50 + dx}`);
    grad.setAttribute("y2", `${55 + dy}`);
  }
  const turb = el.querySelector("feTurbulence");
  turb?.setAttribute("seed", `${(Math.random() * 999) | 0}`);
  turb?.setAttribute("baseFrequency", `${rand(0.72, 0.98).toFixed(2)}`);
}

/**
 * The same hue, taken down to something that can tint a letter.
 *
 * `screen` is the one blend that leaves the paper alone (screening anything
 * onto near-white stays near-white), which is why the copy on top of the type
 * uses it — but screening a *pastel* onto charcoal only lifts it toward milky
 * grey, which is the washed-out look the crossing used to have. Screening a
 * dark, saturated version of the same hue onto charcoal lands on a rich,
 * readable colour instead: the letter takes the print's hue rather than losing
 * its own density.
 *
 * So: keep the hue, force the saturation up and the lightness down. The print
 * under the type keeps the palette's real pastel — this is only ever the
 * overlay's copy.
 *
 * The lightness is not a taste call. A tinted letter still has to be readable
 * while the print is over it, and at 0.32 the palette's lime bottomed out at
 * 2.80:1 against the paper — under the 3:1 floor large text has to clear. 0.28
 * puts the worst hue (still lime) at 3.35:1 and every other one above 4, with
 * the overlay's own opacity only ever pulling the letter back toward its ink.
 */
function deepen(hex: string, sat = 0.8, light = 0.28) {
  const [r, g, b] = rgbChannels(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h /= 6;
  }
  // Achromatic stops (the palette has none today, but a future one might)
  // have no hue to preserve, so they just go dark.
  const S = max === min ? 0 : sat;
  const c = (1 - Math.abs(2 * light - 1)) * S;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = light - c / 2;
  const seg = Math.floor(h * 6) % 6;
  const rgb = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg];
  const hx = (v: number) =>
    Math.round(clamp((v + m) * 255, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${hx(rgb[0])}${hx(rgb[1])}${hx(rgb[2])}`;
}

/**
 * Copy a freshly-painted slot's colourway onto a second slot, so the two are
 * the same print rather than two rolls of the dice.
 *
 * This exists for the overlay pool (see POOL_OVER): a print that crosses the
 * headline is drawn twice, once behind the type and once on top of it in
 * `screen`, and the pair only reads as one object if they share a gradient,
 * a stop split and a turbulence seed.
 */
function mirrorPaint(src: HTMLElement, dst: HTMLElement, deep = false) {
  const ss = src.querySelectorAll<SVGStopElement>("stop");
  const ds = dst.querySelectorAll<SVGStopElement>("stop");
  ss.forEach((st, i) => {
    const d = ds[i];
    if (!d) return;
    const c = st.getAttribute("stop-color") ?? "";
    d.setAttribute("stop-color", deep ? deepen(c) : c);
    d.setAttribute("offset", st.getAttribute("offset") ?? `${i * 50}%`);
  });
  const sg = src.querySelector("linearGradient");
  const dg = dst.querySelector("linearGradient");
  if (sg && dg) {
    for (const a of ["x1", "y1", "x2", "y2"]) {
      dg.setAttribute(a, sg.getAttribute(a) ?? "");
    }
  }
  const stb = src.querySelector("feTurbulence");
  const dtb = dst.querySelector("feTurbulence");
  if (stb && dtb) {
    for (const a of ["seed", "baseFrequency"]) {
      dtb.setAttribute(a, stb.getAttribute(a) ?? "");
    }
  }
}

// One gradient + one grain filter per pool slot. Both are re-randomized on
// every spawn (see paintPrint), so the 44 slots keep cycling fresh colorways.
//
// The filter is the ethereal part: turbulence roughens the silhouette, a blur
// turns the alpha into a soft ramp, and the arithmetic composite multiplies
// that ramp back against the same noise — dense pigment in the middle, stipple
// dissolving into nothing at the edge.
function PawDefs({ id }: { id: string }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient
          id={`pg-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={50 - GRAD_R}
          y1={55 - GRAD_R}
          x2={50 + GRAD_R}
          y2={55 + GRAD_R}
        >
          <stop offset="0%" stopColor={HUES.paleBlue} />
          <stop offset="50%" stopColor={HUES.lavender} />
          <stop offset="100%" stopColor={HUES.orange} />
        </linearGradient>
        <filter
          id={`pf-${id}`}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={3}
            seed={1}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={7}
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feGaussianBlur in="rough" stdDeviation={2.4} result="soft" />
          {/* Flatten the same noise to white-with-noisy-alpha, then clip the
              blurred paw through it. Clipping by alpha (rather than compositing
              the noise's color in) keeps the gradient's hues clean while the
              blur's edge ramp thins the stipple out to nothing. The 0.34 floor
              stops the middle from dissolving into pure dust. */}
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.72 0.34"
            result="grain"
          />
          <feComposite in="soft" in2="grain" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

function PawShapes({ id }: { id: string }) {
  const cls = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  return (
    <>
      {ANIMALS.map((a) => (
        <svg
          key={a}
          data-shape={a}
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          width={PAW_W}
          height={PAW_H}
          className={cls}
          style={{ display: "none", overflow: "visible" }}
        >
          <ShapeGroup
            animal={a}
            fill={`url(#pg-${id})`}
            filter={`url(#pf-${id})`}
          />
        </svg>
      ))}
    </>
  );
}

export default function FootprintsHome({
  footprintPicker = false,
  inverted = false,
  tint = null,
  introWalk = "corner",
  awaitReveal = false,
  children,
}: {
  // Render the 5-animal picker (which critter's prints appear).
  footprintPicker?: boolean;
  // Flip to inverted polarity (dark panel, paper prints/text).
  inverted?: boolean;
  // A palette hue every print should be mixed around; null = free-for-all.
  // See paintPrint. The hero drives this off its rotating verb.
  tint?: string | null;
  // Which greeting trail plays on mount. "corner" is the original four prints
  // in the lower left (the footer's). "cross" walks the full width of the box,
  // for the hero, where the box is a whole viewport and four prints in a
  // corner leave the screen looking dead until the pointer moves.
  introWalk?: "corner" | "cross";
  // Hold the ambient walker until `.hero-active` is on <html> — i.e. until the
  // panel this lives in is actually uncovered. The footer is a fixed curtain
  // behind the page, so without this its walkers would amble across a hidden
  // panel for the whole visit and the reveal would land on an empty one.
  awaitReveal?: boolean;
  children?: ReactNode;
} = {}) {
  // SVG ids are document-global, so each mount (hero + footer both render this)
  // namespaces its gradient/filter ids. useId's colons aren't url(#…)-safe.
  const slotId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quietBoxes = useRef<
    { left: number; top: number; right: number; bottom: number }[]
  >([]);
  const paws = useRef<HTMLDivElement[]>([]);
  const pawI = useRef(0);
  const pawsSoft = useRef<HTMLDivElement[]>([]);
  const pawSoftI = useRef(0);
  const pawsOver = useRef<HTMLDivElement[]>([]);
  const pawOverI = useRef(0);
  const wipes = useRef<Wipe[]>([]);
  const dims = useRef({ w: 0, h: 0 });
  const lastStep = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastWipe = useRef<{ x: number; y: number } | null>(null);
  const side = useRef(1);
  const reduced = useRef(false);
  // When the visitor's own pointer last laid something down. The ambient
  // walker waits on this: it only crosses while the page is being left alone.
  const lastPointerAt = useRef(0);

  // The chosen animal is shared across every FootprintsHome on the page (hero +
  // footer) and persists, so picking one anywhere changes all of them.
  const { footprint: sel, setFootprint } = useFootprint();
  // Ambient footprint picker: a fixed trigger showing the chosen animal; click
  // fans the rest upward, choosing one collapses back to the same spot.
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  // The spawn path runs off the gsap ticker and pointer handlers, so it reads a
  // ref rather than closing over a render's value.
  const selRef = useRef<Animal>(sel);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);
  // Same reason as selRef: spawnPrint runs off the ticker and pointer
  // handlers, so the live tint has to be readable without a re-render.
  const tintRef = useRef<string | null>(tint);
  useEffect(() => {
    tintRef.current = tint;
  }, [tint]);
  const select = (a: Animal) => {
    setFootprint(a);
    setPickerOpen(false);
  };

  // Close the picker on an outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown: EventListener = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPickerOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  // Surface palette. Dark frost + paper prints on a light page, and the reverse
  // on the one-pager footer, which asks for `inverted`. The hero backdrop keeps
  // the page's own polarity. Prints are independent of this either way — they're
  // mixed from HUES/BLENDS.
  const pal: Palette = useMemo(() => {
    const { paper, ink, footer } = SURFACE;
    const bg = inverted ? footer : paper;
    const fg = inverted ? paper : ink;
    return {
      bg,
      fog: `rgba(${rgbTriplet(bg)}, 0.72)`,
      ink: fg,
      pickerActive: `rgba(${rgbTriplet(fg)}, 0.12)`,
    };
  }, [inverted]);
  // The canvas paints off the gsap ticker, so it reads the palette from a ref.
  const palRef = useRef(pal);
  useEffect(() => {
    palRef.current = pal;
  }, [pal]);

  /**
   * The footer panel drifts between FOOTER_HUES — a new one every
   * FOOTER_HUE_HOLD seconds, eased over FOOTER_HUE_FADE.
   *
   * Channels are interpolated in a plain object, and each frame writes the
   * result to two places at once: `--invert-bg` (which the panel's background,
   * the nav's scrim gradient and the cursor label all read) and palRef (which
   * the canvas frost veil reads, since canvas can't see CSS vars). Driving both
   * from one tween is the point — the veil sits at 0.72 alpha over the panel,
   * so a veil lagging the panel would show as a mismatched patch wherever the
   * cursor has wiped the frost.
   *
   * The panel's background is `var(--invert-bg)` rather than an inline hex
   * precisely so a React re-render (the picker opening, say) can't snap the
   * colour back to its starting value mid-drift.
   */
  useEffect(() => {
    if (!inverted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let i = 0;
    const [r, g, b] = rgbChannels(FOOTER_HUES[i]);
    const c = { r, g, b };
    const apply = () => {
      const triplet = `${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}`;
      document.documentElement.style.setProperty("--invert-bg", `rgb(${triplet})`);
      palRef.current = {
        ...palRef.current,
        bg: `rgb(${triplet})`,
        fog: `rgba(${triplet}, 0.72)`,
      };
    };

    let tween: gsap.core.Tween | null = null;
    let wait: gsap.core.Tween | null = null;
    const step = () => {
      // Random, not a cycle — but never the hue already showing.
      let n = i;
      while (n === i) n = Math.floor(Math.random() * FOOTER_HUES.length);
      i = n;
      const [nr, ng, nb] = rgbChannels(FOOTER_HUES[i]);
      tween = gsap.to(c, {
        r: nr,
        g: ng,
        b: nb,
        duration: FOOTER_HUE_FADE,
        ease: "sine.inOut",
        onUpdate: apply,
        onComplete: () => {
          wait = gsap.delayedCall(FOOTER_HUE_HOLD, step);
        },
      });
    };
    wait = gsap.delayedCall(FOOTER_HUE_HOLD, step);

    return () => {
      tween?.kill();
      wait?.kill();
      document.documentElement.style.removeProperty("--invert-bg");
    };
  }, [inverted]);

  // 0 over any protected element (calm) → 1 out in the open.
  const quietFactor = (x: number, y: number) => {
    let m = 1;
    for (const b of quietBoxes.current) {
      m = Math.min(m, clamp(rectDist(x, y, b) / QUIET_FADE, 0, 1));
    }
    return m;
  };

  const spawnPrint = (
    animal: Animal,
    x: number,
    y: number,
    rot: number,
    p: number,
    fade = 1,
    // Draw this print as a crossing: the walkers routed through the headline
    // get two more copies of it. One is lifted above the frost and blurred
    // wide (the passing mass); the other sits on top of the type in `screen`,
    // deepened, so the letters take the print's hue as it goes under them.
    // A cursor print is never a crossing — the quiet zones keep the pointer's
    // own trail off the sentence.
    overlay = false,
  ) => {
    if (fade <= 0.06) return; // inside the quiet zone — no print
    const el = paws.current[pawI.current++ % POOL];
    if (!el) return;
    el.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
      s.style.display = s.getAttribute("data-shape") === animal ? "block" : "none";
    });
    paintPrint(el, tintRef.current);

    const opacity = lerp(0.45, 0.88, p) * fade;
    const scale = lerp(0.82, 1.2, p) * SIZE[animal] * lerp(0.72, 1, fade);
    const out = lerp(1.4, 2.4, p);
    // A cursor print snaps up and fades; a crossing breathes in and out, which
    // is why they take different envelopes rather than different durations of
    // the same one.
    const run = (target: HTMLElement, o: number, soft = false) => {
      gsap.killTweensOf(target);
      gsap.set(target, {
        x,
        y,
        rotation: rot,
        scale: scale * (soft ? 0.92 : 0.78),
        opacity: 0,
      });
      if (soft) {
        gsap.to(target, {
          opacity: o,
          scale,
          duration: SOFT_IN,
          ease: "sine.inOut",
        });
        gsap.to(target, {
          opacity: 0,
          scale: scale * 1.05,
          duration: SOFT_OUT,
          ease: "sine.inOut",
          delay: SOFT_IN + SOFT_HOLD,
        });
        return;
      }
      gsap.to(target, { opacity: o, scale, duration: 0.18, ease: "power2.out" });
      gsap.to(target, {
        opacity: 0,
        duration: out,
        ease: "power1.in",
        delay: 0.5 + p * 0.4,
      });
    };
    run(el, opacity, overlay);

    if (overlay) {
      // The passing mass: same print, same colourway, above the frost and
      // blurred by the layer it lives in.
      const sf = pawsSoft.current[pawSoftI.current++ % POOL_SOFT];
      if (sf) {
        sf.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
          s.style.display =
            s.getAttribute("data-shape") === animal ? "block" : "none";
        });
        mirrorPaint(el, sf);
        run(sf, opacity * SOFT_ALPHA, true);
      }

      // The copy that tints the letters. `deep` is the whole trick — see
      // deepen(): screening the palette's pastel onto charcoal only makes it
      // milky, screening a dark saturated cousin of it makes it colour.
      const ov = pawsOver.current[pawOverI.current++ % POOL_OVER];
      if (ov) {
        ov.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
          s.style.display =
            s.getAttribute("data-shape") === animal ? "block" : "none";
        });
        mirrorPaint(el, ov, true);
        run(ov, Math.min(1, opacity * 1.2), true);
      }
    }
  };

  const addWipe = (x: number, y: number, r = WIPE_R, s = 1) => {
    wipes.current.push({ x, y, s, r });
    if (wipes.current.length > 80) wipes.current.shift();
  };

  const coords = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced.current) return;
    lastPointerAt.current = performance.now();
    const { x, y } = coords(e);
    const q = quietFactor(x, y); // 0 over the menu → 1 out in the open

    // Clear a frost trail so the prints show through (faded near the menu).
    if (q > 0.08) {
      const lw = lastWipe.current;
      if (!lw || Math.hypot(x - lw.x, y - lw.y) > WIPE_MIN) {
        addWipe(x, y, WIPE_R, q);
        lastWipe.current = { x, y };
      }
    }

    // Lay a footprint every stride of travel; speed → pressure.
    const prev = lastStep.current;
    const now = performance.now();
    if (!prev) {
      lastStep.current = { x, y, t: now };
      return;
    }
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.hypot(dx, dy);
    const animal = selRef.current;
    if (dist < STRIDE[animal]) return;
    const speed = dist / Math.max(now - prev.t, 1);
    const p = clamp(1 - speed / SPEED_MAX, 0.18, 1);
    const ang = Math.atan2(dy, dx);
    const perp = ang + Math.PI / 2;
    spawnPrint(
      animal,
      x + Math.cos(perp) * FOOTW[animal] * side.current,
      y + Math.sin(perp) * FOOTW[animal] * side.current,
      (ang * 180) / Math.PI + 90,
      p,
      q,
    );
    side.current *= -1;
    lastStep.current = { x, y, t: now };
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced.current) return;
    lastPointerAt.current = performance.now();
    const { x, y } = coords(e);
    const q = quietFactor(x, y);
    spawnPrint(selRef.current, x, y, rand(-15, 15), 1, q); // deliberate stomp
    if (q > 0.08) addWipe(x, y, WIPE_R * 1.6, q);
  };

  const onLeave = () => {
    lastStep.current = null;
    lastWipe.current = null;
  };

  // The body scroll-lock for the single-screen home is owned by SiteFrame,
  // route-aware, so it can never leak onto inner pages (see SiteFrame).

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const sizeCanvas = () => {
      const el = root.current!;
      const w = el.clientWidth;
      const h = el.clientHeight;
      dims.current = { w, h };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const computeQuietBoxes = () => {
      const rt = root.current;
      if (!rt) return;
      const o = rt.getBoundingClientRect();
      // Callers (e.g. the footer, the hero) mark their text with [data-quiet]
      // so prints fade around it and it stays readable + clickable.
      const els = rt.querySelectorAll<HTMLElement>("[data-quiet]");
      quietBoxes.current = Array.from(els, (el) => {
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2 - o.left;
        const cy = (r.top + r.bottom) / 2 - o.top;
        const hw = Math.max(r.width / 2 + QUIET_PAD, QUIET_MIN_HW);
        const hh = Math.max(r.height / 2 + QUIET_PAD, QUIET_MIN_HH);
        return { left: cx - hw, top: cy - hh, right: cx + hw, bottom: cy + hh };
      });
    };
    const onResize = () => {
      sizeCanvas();
      computeQuietBoxes();
    };
    sizeCanvas();
    computeQuietBoxes();
    if (document.fonts) document.fonts.ready.then(computeQuietBoxes);
    // A ResizeObserver on the box itself, not just window resize: the footer
    // panel is --footer-h tall and that variable is raised at runtime to
    // whatever its content needs (SiteFooter measures it), so the box can
    // change size without the window doing anything. On window resize alone
    // the veil stayed at the old height and the bottom of the footer came up
    // unfrosted. The window listener stays for a devicePixelRatio change that
    // doesn't move the box, which the observer won't see.
    const ro = new ResizeObserver(onResize);
    ro.observe(root.current!);
    window.addEventListener("resize", onResize);

    const paintFog = (dt: number) => {
      const { w, h } = dims.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = palRef.current.fog;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-out";
      wipes.current = wipes.current.filter((wp) => {
        wp.s -= dt / REFOG_MS;
        if (wp.s <= 0) return false;
        const g = ctx.createRadialGradient(wp.x, wp.y, 0, wp.x, wp.y, wp.r);
        g.addColorStop(0, `rgba(0,0,0,${wp.s})`);
        g.addColorStop(0.65, `rgba(0,0,0,${wp.s * 0.85})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced.current) {
      const { w, h } = dims.current;
      for (let i = 0; i < 5; i++) {
        const el = paws.current[i];
        if (!el) continue;
        const a = ANIMALS[i % ANIMALS.length];
        el.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
          s.style.display = s.getAttribute("data-shape") === a ? "block" : "none";
        });
        paintPrint(el, tintRef.current);
        gsap.set(el, {
          x: w * (0.2 + i * 0.14),
          y: h * 0.7,
          rotation: i % 2 ? 8 : -8,
          scale: SIZE[a],
          opacity: 0.85,
        });
      }
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      return;
    }

    const update = (_t: number, deltaMs: number) => paintFog(Math.min(deltaMs, 50));
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(paws.current);
      gsap.killTweensOf(pawsSoft.current);
      gsap.killTweensOf(pawsOver.current);
      wipes.current = [];
    };
  }, []);

  // Somebody keeps walking through here, and the visitor is following them.
  //
  // "corner" is the footer's: four prints scuffed into the lower left, once,
  // because that panel is short and the eye is already there.
  //
  // "cross" is the hero's, and it doesn't stop. A walker crosses the viewport
  // shortly after mount, and another sets off every time the pointer has been
  // still for a beat, so the screen is never dead but never competes with a
  // visitor who is actually using it. Each crossing picks a different route,
  // all of them kept to the lower half; quietFactor fades anything that does
  // stray near the headline, so the sentence is never stamped over.
  useEffect(() => {
    if (reduced.current) return;

    // Routes are paths in unit space (0–1 of the box), sampled into strides.
    // They all live below the midline and run off both edges, so a walker
    // arrives from somewhere and leaves for somewhere rather than appearing.
    const ROUTES: ((t: number) => { x: number; y: number })[] = [
      // Left → right, a shallow sine through the lower third.
      (t) => ({ x: -0.04 + t * 1.08, y: 0.74 + Math.sin(t * Math.PI * 1.6) * 0.055 }),
      // Right → left, lower and flatter: a second creature, later, heavier.
      (t) => ({ x: 1.04 - t * 1.08, y: 0.84 - Math.sin(t * Math.PI * 1.2) * 0.045 }),
      // Up out of the bottom-left corner and off the right edge.
      (t) => ({ x: -0.04 + t * 1.08, y: 1.02 - t * 0.38 }),
      // In from the right, dipping to the bottom edge and away.
      (t) => ({ x: 1.04 - t * 0.72, y: 0.6 + t * 0.44 }),
      // A short wander that enters and leaves through the bottom.
      (t) => ({ x: 0.18 + t * 0.5, y: 1.02 - Math.sin(t * Math.PI) * 0.26 }),
    ];

    // Every so often one of them walks straight through the headline instead of
    // politely around it. The route is aimed at the widest protected box rather
    // than at a hard-coded band, so it finds the type wherever the layout puts
    // it, and the crossing is drawn in the overlay pool as well — the letters
    // take the print's colour as it passes under them.
    const THROUGH_EVERY = 2; // every other walk goes through the sentence
    let crossings = 0;

    const throughRoute = (w: number, h: number) => {
      const boxes = quietBoxes.current;
      if (!boxes.length) return null;
      const target = boxes.reduce((a, b) =>
        b.right - b.left > a.right - a.left ? b : a,
      );
      // Only walk through something with the heft of a headline. The footer's
      // widest protected box is its one-line colophon; a print stamped over
      // 13px mono caps reads as a smudge, not as a creature passing under type.
      if (target.bottom - target.top < h * 0.08) return null;
      const cy = (target.top + target.bottom) / 2 / h;
      const band = Math.min((target.bottom - target.top) / h * 0.28, 0.06);
      const dir = Math.random() < 0.5 ? 1 : -1;
      return (t: number) => ({
        x: dir > 0 ? -0.06 + t * 1.12 : 1.06 - t * 1.12,
        // Drifts across the type rather than ruling a line through it.
        y: cy + Math.sin(t * Math.PI * 1.3 + 0.4) * band,
      });
    };

    const IDLE_MS = 4000; // pointer quiet for this long → send someone across
    let calls: ReturnType<typeof gsap.delayedCall>[] = [];

    const walk = () => {
      const { w, h } = dims.current;
      if (!w || !h) {
        calls.push(gsap.delayedCall(0.3, walk));
        return;
      }
      const through = crossings++ % THROUGH_EVERY === THROUGH_EVERY - 1;
      const path =
        (through ? throughRoute(w, h) : null) ??
        ROUTES[(Math.random() * ROUTES.length) | 0];
      const n = 13 + ((Math.random() * 5) | 0);
      // Seconds between strides. A full crossing takes five or six seconds:
      // this is an amble, not a dash.
      const pace = rand(0.3, 0.44);
      const animal = selRef.current;
      let foot = 1;

      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const a = path(t);
        const b = path(Math.min(t + 0.02, 1));
        // Heading from the path itself, so the print turns with the walker.
        const ang = Math.atan2((b.y - a.y) * h, (b.x - a.x) * w);
        const perp = ang + Math.PI / 2;
        const x = a.x * w + Math.cos(perp) * FOOTW[animal] * foot;
        const y = a.y * h + Math.sin(perp) * FOOTW[animal] * foot;
        foot *= -1;
        // Heaviest mid-stride, lighter as they arrive and leave.
        const p = 0.4 + Math.sin(t * Math.PI) * 0.45;
        calls.push(
          gsap.delayedCall(0.2 + i * pace, () => {
            // A through-walker ignores the quiet zones; that's the whole point
            // of it. Everyone else fades out as they near the type.
            const q = through ? 1 : quietFactor(x, y);
            spawnPrint(animal, x, y, (ang * 180) / Math.PI + 90, p, q, through);
            if (q > 0.08) addWipe(x, y, WIPE_R, q);
          }),
        );
      }
      // Once they're off the edge, wait for the page to go quiet again.
      calls.push(gsap.delayedCall(0.2 + n * pace + rand(0.6, 1.8), queue));
    };

    // Hold until the visitor's own pointer has been still for IDLE_MS, then
    // send the next walker. Re-checks rather than listening, so a pointer that
    // never stops moving simply never lets anyone through.
    const queue = () => {
      calls = calls.filter((c) => c.isActive());
      if (awaitReveal && !document.documentElement.classList.contains("hero-active")) {
        calls.push(gsap.delayedCall(0.5, queue));
        return;
      }
      const since = performance.now() - lastPointerAt.current;
      if (since < IDLE_MS) {
        calls.push(gsap.delayedCall((IDLE_MS - since) / 1000, queue));
        return;
      }
      walk();
    };

    if (introWalk === "corner") {
      const steps = Array.from({ length: 4 }, (_, i) => ({
        at: 0.25 + i * 0.18,
        x: dims.current.w * (0.16 + i * 0.1),
        y: dims.current.h * (0.85 - i * 0.02),
        rot: i % 2 ? 14 : -14,
      }));
      calls = steps.map((s) =>
        gsap.delayedCall(s.at, () => {
          const q = quietFactor(s.x, s.y);
          spawnPrint(selRef.current, s.x, s.y, s.rot, 0.7, q);
          if (q > 0.08) addWipe(s.x, s.y, WIPE_R, q);
        }),
      );
    } else if (awaitReveal) {
      // Nothing on mount: the first walker waits for the curtain to lift, then
      // for the pointer to settle, like every one after it.
      calls.push(gsap.delayedCall(0.45, queue));
    } else {
      calls.push(gsap.delayedCall(0.45, walk));
    }

    return () => calls.forEach((c) => c.kill());
  }, [introWalk, awaitReveal]);

  return (
    <div
      ref={root}
      aria-label="Home"
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerLeave={onLeave}
      className="absolute inset-0 z-0 flex flex-col"
      style={{
        // Inverted (the footer): the colour loop above owns this, via the var,
        // and supplies its own easing — hence no CSS transition on it here.
        backgroundColor: inverted ? "var(--invert-bg)" : pal.bg,
        color: pal.ink,
        transition: inverted ? "color 0.6s ease" : "background-color 0.6s ease, color 0.6s ease",
      }}
    >
      {/* Footprints — under the frosted glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {Array.from({ length: POOL }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) paws.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <PawDefs id={`${slotId}-${i}`} />
            <PawShapes id={`${slotId}-${i}`} />
          </div>
        ))}
      </div>

      {/* Frosted-glass veil — your cursor clears it; it slowly re-fogs */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
      />

      {/* The crossing's passing mass — above the frost, below the type.
          Everything else the engine draws sits under the veil and is muted by
          it; a walker going through the headline has to be seen doing it, so
          its second copy is lifted over the frost and blurred wide. The blur
          is on the layer, not the slots, so it costs one filter rather than
          eighteen. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[15]"
        style={{ filter: `blur(${SOFT_BLUR}px)` }}
      >
        {Array.from({ length: POOL_SOFT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) pawsSoft.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <PawDefs id={`${slotId}-sf-${i}`} />
            <PawShapes id={`${slotId}-sf-${i}`} />
          </div>
        ))}
      </div>

      {/* Bare frosted-footprint layer with caller-supplied content above the
          frost. The wrapper stays pointer-events-none so the cursor still
          lays prints in the gaps; interactive children opt back in with
          pointer-events-auto. */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ color: pal.ink }}
      >
        {children}
      </div>

      {/* The print once more, on top of the type in `screen`, in the deepened
          cousin of its own colourway. Over the paper this is a no-op
          (screening anything onto near-white leaves near-white), so it shows
          up only where a print crosses a dark letterform — and there the
          letter takes the print's hue at its own density instead of washing
          out toward grey, which is what the pastel used to do. Only the
          headline crossings feed it — see the ambient walker. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30"
        style={{ mixBlendMode: "screen" }}
      >
        {Array.from({ length: POOL_OVER }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) pawsOver.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <PawDefs id={`${slotId}-ov-${i}`} />
            <PawShapes id={`${slotId}-ov-${i}`} />
          </div>
        ))}
      </div>

      {/* The footprint picker, bottom-RIGHT, on the same h-9 baseline as the
          copyright the footer renders on the left. Its animals fan upward from
          the trigger; data-quiet + stopPropagation keep prints from spawning
          over the controls. */}
      {footprintPicker && (
        <div className="pointer-events-auto absolute bottom-8 right-5 z-30 flex h-9 items-center gap-3 sm:right-8">
          <div
            data-quiet
            className="flex h-9 items-center"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
          >
            <div ref={pickerRef} className="relative flex h-8 items-center">
              {/* the other animals — fan upward from the fixed trigger on click */}
              <div
                // No -translate-x-1/2: in Tailwind v4 it emits the standalone
                // `translate` property, which stacks with the inline `transform`
                // (double -50% → offset). The inline transform centers it.
                className="absolute bottom-full left-1/2 mb-2 flex flex-col items-center gap-1.5 transition-all duration-200"
                style={{
                  opacity: pickerOpen ? 1 : 0,
                  pointerEvents: pickerOpen ? "auto" : "none",
                  transform: pickerOpen ? "translate(-50%, 0)" : "translate(-50%, 6px)",
                }}
              >
                {ANIMALS.filter((a) => a !== sel).map((a) => (
                  <button
                    key={a}
                    onClick={() => select(a)}
                    aria-label={`${a} footprints`}
                    tabIndex={pickerOpen ? 0 : -1}
                    data-cursor-label={a[0].toUpperCase() + a.slice(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                  >
                    <svg viewBox="0 0 100 110" width="21" height="23" style={{ opacity: 0.75 }}>
                      <ShapeGroup animal={a} fill={pal.ink} />
                    </svg>
                  </button>
                ))}
              </div>

              {/* trigger — the current animal, in a fixed position */}
              <button
                onClick={() => setPickerOpen((o) => !o)}
                aria-label="Choose footprints"
                aria-expanded={pickerOpen}
                data-cursor-label={sel[0].toUpperCase() + sel.slice(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: pal.pickerActive, boxShadow: `inset 0 0 0 2px ${pal.ink}` }}
              >
                <svg viewBox="0 0 100 110" width="21" height="23">
                  <ShapeGroup animal={sel} fill={pal.ink} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
