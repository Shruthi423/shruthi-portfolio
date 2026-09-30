"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/app/lib/gsap";
import { useFootprint } from "@/app/components/shared/FootprintProvider";
import { SHAPES, SIGNATURE_BLEND, SURFACE } from "@/app/lib/footprints";

/**
 * The intro splash — one print, one bloom.
 *
 * A single large track fades up centre-screen, its stipple resolves from dust
 * into solid pigment, then it scales past the camera into the hero. Quiet,
 * closer to a logo reveal than an animation.
 *
 * It uses the same gradient and the same turbulence filter as the live cursor
 * prints and the favicon, so the splash, the tab and the trail are one mark
 * rather than three drawings of the same idea.
 *
 * (A walk-on trail variant was built alongside this and cut.)
 */

// Once per tab, written only after the reveal has actually finished playing.
// A first-time visitor gets it; someone clicking back to the home five minutes
// later doesn't get made to sit through it again.
const SESSION_KEY = "splash-seen";

// The print's size as a fraction of the viewport's short edge. Big enough to
// read as a mark rather than a cursor print, small enough to keep air around it.
const BLOOM_SCALE = 0.46;

// The shapes are drawn for a 0 0 100 110 box; Print pads that to leave the
// stipple room to bleed. Filter maths converts through this width.
const VB_W = 128;
const VB_H = 138;

/**
 * One print. Its own gradient + stipple filter, ids namespaced by `slot` so the
 * ids stay namespaced by `slot`. The turbulence starts wide open (pure
 * speckle) — animating baseFrequency down and the alpha floor up is what makes
 * the print resolve out of dust into solid pigment.
 */
function Print({
  slot,
  animal,
  size,
}: {
  slot: string;
  animal: string;
  size: number;
}) {
  const [c0, c1, c2] = SIGNATURE_BLEND;
  return (
    <svg
      data-print={slot}
      viewBox={`-14 -14 ${VB_W} ${VB_H}`}
      width={size}
      height={(size * VB_H) / VB_W}
      className="absolute left-0 top-0"
      style={{ overflow: "visible", opacity: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`sg-${slot}`}
          gradientUnits="userSpaceOnUse"
          x1={-20}
          y1={-20}
          x2={120}
          y2={130}
        >
          <stop offset="0%" stopColor={c0} />
          <stop offset="50%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <filter
          id={`sf-${slot}`}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            data-turb
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            seed={4}
            result="n"
          />
          <feDisplacementMap
            data-disp
            in="SourceGraphic"
            in2="n"
            scale={22}
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feGaussianBlur data-blur in="rough" stdDeviation={4} result="soft" />
          <feColorMatrix
            data-floor
            in="n"
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0.05"
            result="grain"
          />
          <feComposite in="soft" in2="grain" operator="in" />
        </filter>
      </defs>
      <g
        fill={`url(#sg-${slot})`}
        filter={`url(#sf-${slot})`}
        dangerouslySetInnerHTML={{ __html: SHAPES[animal as never] }}
      />
    </svg>
  );
}

// How the stipple should look ON SCREEN, in CSS pixels, at dust (0) and solid
// (1). Expressing these in px rather than viewBox units is the whole point:
// SVG filter attributes are in user units, so a value that reads as fine grain
// on an 82px cursor print reads as fat blobs on a 374px splash. GRAIN is the
// period of one speckle, so smaller is finer.
const DUST = { blur: 5, disp: 16, grain: 1.6, slope: 0.9, floor: 0.06 };
// grain 0.85px was sharp but sub-pixel on a 2x display: the speckle averaged
// out and the print read as a smooth gradient blob. 1.5px keeps the edge crisp
// while the texture survives retina.
const SOLID = { blur: 1.3, disp: 4, grain: 1.5, slope: 0.5, floor: 0.54 };

/**
 * Drive one print's filter from dust (v=0) to solid (v=1). GSAP can't tween SVG
 * filter attributes directly, so this tweens a plain object and writes the
 * attributes on each update.
 *
 * `u` is user units per CSS pixel (VB_W / rendered width). Every px target
 * above is converted through it, so the print stipples identically whatever
 * size it's drawn at.
 */
function resolveFrom(el: SVGElement, t: { v: number }, u: number) {
  const turb = el.querySelector("[data-turb]");
  const disp = el.querySelector("[data-disp]");
  const blur = el.querySelector("[data-blur]");
  const floor = el.querySelector("[data-floor]");
  const v = t.v;
  const mix = (a: number, b: number) => a + (b - a) * v;

  // baseFrequency is cycles per user unit, so it's the reciprocal of the
  // period: px → user units → cycles.
  turb?.setAttribute(
    "baseFrequency",
    `${(1 / (mix(DUST.grain, SOLID.grain) * u)).toFixed(3)}`,
  );
  disp?.setAttribute("scale", `${(mix(DUST.disp, SOLID.disp) * u).toFixed(2)}`);
  blur?.setAttribute(
    "stdDeviation",
    `${(mix(DUST.blur, SOLID.blur) * u).toFixed(3)}`,
  );
  // Sparse, barely-there speckle → dense pigment with a high alpha floor.
  floor?.setAttribute(
    "values",
    `0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${mix(DUST.slope, SOLID.slope).toFixed(
      2,
    )} ${mix(DUST.floor, SOLID.floor).toFixed(2)}`,
  );
}

export default function Splash() {
  const [done, setDone] = useState(false);
  const [play, setPlay] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { footprint } = useFootprint();
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Decide whether it runs at all, before anything is drawn.
  //
  // This only READS the session flag. Writing it here looks tidier but breaks
  // the splash outright: React StrictMode (on by default in Next dev) invokes
  // effects twice, so the first pass would mark it seen and the second would
  // read that back and skip — the splash marking itself watched before it ever
  // played. The write happens at the end of the timeline instead, in finish().
  useEffect(() => {
    // ?splash forces a replay regardless of the session flag. Reaching for the
    // console to clear sessionStorage every time you want to look at the intro
    // is no way to work on it.
    const forced =
      new URLSearchParams(window.location.search).get("splash") !== null;
    if (forced) {
      setPlay(true);
      return;
    }
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SESSION_KEY);
    } catch {}
    if (seen) setDone(true);
    else setPlay(true);
  }, []);

  // Print size is a fraction of the viewport, so measure before drawing it.
  useEffect(() => {
    const el = root.current;
    if (!play || !el) return;
    const r = el.getBoundingClientRect();
    setBox({ w: r.width, h: r.height });
  }, [play]);

  useEffect(() => {
    if (!box.w) return;
    const el = root.current;
    if (!el) return;

    // The splash covers a page that is already laid out underneath, so the
    // scroll has to be pinned for its duration or the reveal lands mid-page.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const p = el.querySelector<SVGElement>("[data-print]");
    if (!p) return;
    const { w, h } = box;
    const size = Math.min(w, h) * BLOOM_SCALE;
    // User units per CSS pixel — the conversion the filter targets run through.
    const u = VB_W / size;
    const finish = () => {
      document.body.style.overflow = prevOverflow;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setDone(true);
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // GSAP can't tween SVG filter attributes, so `t` is a plain object the
    // timeline animates and `resolveFrom` writes through on each update.
    const t = { v: 0 };
    // Frame one must already be dust: the markup's attributes are placeholders
    // written before `size` is known.
    resolveFrom(p, t, u);
    const tl = gsap.timeline({ onComplete: finish });
    gsap.set(p, {
      x: w / 2 - size / 2,
      y: h / 2 - (size * VB_H) / VB_W / 2,
      transformOrigin: "50% 50%",
      scale: reduced ? 1 : 0.86,
      rotation: reduced ? 0 : -6,
    });

    // Reduced motion asks for less movement, not less content. Show the mark
    // solid, hold it briefly, cross-fade out: no dust resolve, no scaling past
    // the camera. (Removing the splash entirely is what hid it from anyone with
    // macOS "Reduce motion" on, silently.)
    if (reduced) {
      resolveFrom(p, { v: 1 }, u);
      tl.to(p, { opacity: 1, duration: 0.35, ease: "power1.out" })
        .to(p, { opacity: 0, duration: 0.4, ease: "power1.in" }, "+=0.5")
        .to(el, { opacity: 0, duration: 0.4, ease: "power1.inOut" }, "<");
      return () => {
        tl.kill();
        document.body.style.overflow = prevOverflow;
      };
    }

    tl.to(p, { opacity: 1, duration: 0.55, ease: "power2.out" })
      // The resolve is the whole idea, so it gets the most time.
      .to(
        t,
        {
          v: 1,
          duration: 1.15,
          ease: "power2.inOut",
          onUpdate: () => resolveFrom(p, t, u),
        },
        0.1,
      )
      .to(p, { scale: 1, rotation: 0, duration: 1.25, ease: "power2.out" }, 0.1)
      // Past the camera and out, with the overlay going at the same moment so
      // the hero is already there behind it.
      .to(p, { scale: 9, opacity: 0, duration: 0.85, ease: "power2.in" }, "+=0.15")
      .to(el, { opacity: 0, duration: 0.6, ease: "power1.inOut" }, "<0.1");

    // Click or key to skip.
    const skip = () => tl.progress(1);
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      el.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      tl.kill();
      document.body.style.overflow = prevOverflow;
    };
  }, [box]);

  if (done || !play) return null;

  const size = Math.min(box.w, box.h) * BLOOM_SCALE;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] cursor-pointer"
      style={{ backgroundColor: SURFACE.paper }}
    >
      {size > 0 && <Print slot="bloom" animal={footprint} size={size} />}
    </div>
  );
}
