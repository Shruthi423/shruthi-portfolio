"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/app/lib/gsap";
import { SIGNATURE_BLEND, SURFACE } from "@/app/lib/footprints";

/**
 * The intro splash — just the count.
 *
 * A number climbs from 0 to 100 on the paper, and at 100 the overlay lifts into
 * the page. Nothing else: no mark, no illustration. The one thing tying it to
 * the site is the signature gradient, which fills the number the same way it
 * fills the cursor prints and the favicon.
 */

// Once per tab, written only after the count has actually finished playing.
// A first-time visitor gets it; someone clicking back to the home five minutes
// later doesn't get made to sit through it again.
const SESSION_KEY = "splash-seen";

// How long the count takes. Long enough to register as a count, short enough
// that it isn't a toll booth in front of the site.
const COUNT_SECONDS = 2.4;

export default function Splash() {
  const [done, setDone] = useState(false);
  const [play, setPlay] = useState(false);
  const [count, setCount] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

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
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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

  useEffect(() => {
    if (!play) return;
    const el = root.current;
    const num = stage.current;
    if (!el || !num) return;

    // The splash covers a page that is already laid out underneath, so the
    // scroll has to be pinned for its duration or the lift lands mid-page.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      document.body.style.overflow = prevOverflow;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setDone(true);
    };

    // Reduced motion asks for less movement, not less content: the count still
    // runs, it just runs short and doesn't travel. (Hiding the splash outright
    // is what silently cut it for anyone with macOS "Reduce motion" on.)
    const soft = reduced.current;

    const c = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(
      num,
      { opacity: 0, y: soft ? 0 : 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    )
      .to(
        c,
        {
          v: 100,
          duration: soft ? 0.8 : COUNT_SECONDS,
          ease: "power1.inOut",
          onUpdate: () => setCount(Math.round(c.v)),
        },
        0,
      )
      // It lifts rather than leaves, which reads as the page arriving rather
      // than the number going somewhere.
      .to(num, {
        opacity: 0,
        y: soft ? 0 : -16,
        duration: 0.45,
        ease: "power2.in",
      })
      .to(el, { opacity: 0, duration: 0.5, ease: "power1.inOut" }, "<0.1");

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
  }, [play]);

  if (done || !play) return null;

  const [c0, c1, c2] = SIGNATURE_BLEND;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center"
      style={{ backgroundColor: SURFACE.paper }}
    >
      <div
        ref={stage}
        className="font-mono tabular-nums leading-none"
        style={{
          opacity: 0,
          fontSize: "clamp(4rem, 16vw, 13rem)",
          letterSpacing: "-0.03em",
          // The same three hues as the prints and the favicon, clipped to the
          // glyphs. tabular-nums above is what stops the number jittering
          // sideways as the digits change.
          backgroundImage: `linear-gradient(135deg, ${c0}, ${c1}, ${c2})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {count}
      </div>
    </div>
  );
}
