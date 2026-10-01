"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "@/app/lib/gsap";
import { SURFACE } from "@/app/lib/footprints";
import {
  WORDMARK_LENGTH,
  WORDMARK_NIB,
  WORDMARK_STROKES,
  WORDMARK_UPM,
  WORDMARK_VIEWBOX as VB,
} from "@/app/components/layout/wordmarkPen";

/**
 * The intro splash — the name, written.
 *
 * A hand writes "Shruthi Aragonda" across the paper in the site's own
 * handwriting while a small count climbs to 100 underneath it. At 100 the name
 * flies up into the nav and lands as the wordmark that was always going to be
 * there, so the splash hands the page its own mark rather than getting out of
 * the way of it.
 *
 * The writing is the DesigningHand trick at wordmark scale: a pen stroke that
 * travels the centre of every letter, used as the mask over the filled glyphs,
 * so ink appears exactly where the nib has passed. The strokes are generated
 * from the real font outlines — see wordmarkPen.ts, and scripts/wordmark-pen.py
 * to regenerate them.
 */

// The splash plays on every page load, refresh included — it is the front door,
// not a one-time gate. Client-side navigations back to the home don't reload the
// document, so this mounts once per load and no session flag is needed.

/** How long the hand takes to write the name, and how long the count takes.
 *  The count finishes first so 100 reads as the cue for the flight. */
const WRITE_SECONDS = 2.2;
/** The nib travels a half-cap clear of each run's start before it inks, so the
 *  round cap never rests on a letter. That lead-in is part of the trip, and the
 *  clock is divided over the real total rather than the sum of the ink. */
const WRITE_TRAVEL =
  WORDMARK_LENGTH + WORDMARK_NIB * WORDMARK_STROKES.length;
const COUNT_SECONDS = 1.9;
/** The flight up into the nav. */
const FLY_SECONDS = 0.85;

export default function Splash() {
  const [done, setDone] = useState(false);
  // Two gates, deliberately apart: `armed` is hydration (nothing is rendered
  // server-side, so a page with no JS is never left staring at blank paper),
  // and `play` is the webfont. The paper goes up as soon as the first is true;
  // the name waits for the second.
  const [armed, setArmed] = useState(false);
  const [play, setPlay] = useState(false);
  const [count, setCount] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<SVGSVGElement>(null);
  const num = useRef<HTMLDivElement>(null);
  const nib = useRef<SVGPathElement[]>([]);
  const reduced = useRef(false);
  const prevOverflow = useRef("");

  // useId's raw value carries punctuation (React 19 wraps it in guillemets),
  // and url(#...) will not resolve an id containing it — the mask would then be
  // silently ignored and the whole name render at once, already written.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `splash-write-${uid}`;

  // Arm it before anything is drawn, but not until the face the pen was traced
  // against is the face on screen: the mask has nothing to bite on until
  // Homemade Apple has loaded, and a fallback would be written and then swapped
  // mid-stroke.
  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // The paper covers a page that is already laid out underneath, and it has
    // to cover it from the first paint through to the landing — both because a
    // flash of the page is the thing a splash exists to prevent, and because a
    // scroll left free here would drop the flight somewhere down the page.
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setArmed(true);
    if (!document.fonts) return setPlay(true);
    let live = true;
    document.fonts.ready.then(() => live && setPlay(true));
    return () => {
      live = false;
      document.body.style.overflow = prevOverflow.current;
    };
  }, []);

  useEffect(() => {
    if (!play) return;
    const el = root.current;
    const word = mark.current;
    if (!el || !word) return;

    // The nav's wordmark is where this one is headed, so it stays out of sight
    // until the written one has landed on it — otherwise two copies of the name
    // are on screen for the whole flight.
    const nav = document.querySelector<HTMLElement>("[data-wordmark]");
    const prevNav = nav?.style.opacity ?? "";
    if (nav) nav.style.opacity = "0";

    const finish = () => {
      document.body.style.overflow = prevOverflow.current;
      if (nav) nav.style.opacity = prevNav;
      setDone(true);
    };

    // Reduced motion asks for less movement, not less content: the name is
    // simply already written, the count runs short, and nothing flies.
    const soft = reduced.current;

    const c = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });

    tl.fromTo(
      word,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" },
      0,
    ).to(
      c,
      {
        v: 100,
        duration: soft ? 0.7 : COUNT_SECONDS,
        ease: "power1.inOut",
        onUpdate: () => setCount(Math.round(c.v)),
      },
      0,
    );

    if (!soft) {
      // Every run is revealed at a constant rate along its own length and takes
      // its share of the write, which is what keeps the nib moving at one speed
      // through the loops as well as the straights.
      let before = 0;
      WORDMARK_STROKES.forEach((stroke, i) => {
        const path = nib.current[i];
        if (!path) return;
        const span = stroke.len + WORDMARK_NIB;
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            duration: (span / WRITE_TRAVEL) * WRITE_SECONDS,
            ease: "none",
          },
          0.15 + (before / WRITE_TRAVEL) * WRITE_SECONDS,
        );
        before += span;
      });

      // Where it is going: the nav wordmark's own box. Measured rather than
      // guessed, so the landing survives the nav's clamped type size and any
      // reflow of the row it sits in.
      const from = word.getBoundingClientRect();
      const to = nav?.getBoundingClientRect();
      const fly = to
        ? {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.width / from.width,
          }
        : { y: -24, scale: 1 };

      tl.to(num.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, ">0.2")
        .to(word, { ...fly, duration: FLY_SECONDS, ease: "power3.inOut" }, "<")
        // The paper goes while the name is still travelling, so the page is
        // already there to receive it.
        .to(el, { opacity: 0, duration: 0.55, ease: "power1.inOut" }, "<0.3");
    } else {
      tl.to(num.current, { opacity: 0, duration: 0.3 }, ">0.1").to(
        el,
        { opacity: 0, duration: 0.4, ease: "power1.inOut" },
        "<",
      );
    }

    // Click or key to skip.
    const skip = () => tl.progress(1);
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      el.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      tl.kill();
      if (nav) nav.style.opacity = prevNav;
    };
  }, [play]);

  if (done || !armed) return null;

  const soft = reduced.current;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center"
      style={{ backgroundColor: SURFACE.paper }}
    >
      <svg
        ref={mark}
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        // The ratio is stated rather than left to `height: auto`, which Safari
        // does not reliably derive from a viewBox.
        style={{
          width: "min(58vw, 760px)",
          aspectRatio: `${VB.w} / ${VB.h}`,
          height: "auto",
          opacity: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={VB.x}
            y={VB.y}
            width={VB.w}
            height={VB.h}
          >
            {WORDMARK_STROKES.map((stroke, i) => (
              <path
                key={i}
                ref={(n) => {
                  if (n) nib.current[i] = n;
                }}
                d={stroke.d}
                fill="none"
                stroke="#fff"
                strokeWidth={WORDMARK_NIB}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  // Gap wide enough that neither the run's own cap nor the
                  // next repeat of the pattern can touch the path, and a
                  // resting offset that parks the cap clear of the start.
                  strokeDasharray: `${stroke.len} ${stroke.len + 2 * WORDMARK_NIB}`,
                  strokeDashoffset: soft ? 0 : stroke.len + WORDMARK_NIB,
                }}
              />
            ))}
          </mask>
        </defs>
        <text
          x={0}
          y={0}
          // The same plum the nav wordmark is on the page, so the name it
          // flies into is the name that was written.
          fill={SURFACE.footer}
          mask={`url(#${maskId})`}
          style={{
            fontFamily: "var(--font-apple)",
            fontSize: WORDMARK_UPM,
            fontKerning: "none",
          }}
        >
          Shruthi Aragonda
        </text>
      </svg>

      <div
        ref={num}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono tabular-nums leading-none sm:bottom-14"
        style={{
          // Small: the count is the loading beat under the name, not the event.
          fontSize: "clamp(0.875rem, 2.2vw, 1.25rem)",
          letterSpacing: "0.02em",
          color: SURFACE.ink,
        }}
      >
        {count}
      </div>
    </div>
  );
}
