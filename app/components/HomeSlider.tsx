"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP, Observer } from "../lib/gsap";
import Hero from "./Hero";
import FootprintsHome from "./FootprintsHome";
import { Footer } from "./Footer";
import HomeTopBar from "./HomeTopBar";
import GrainOverlay from "./GrainOverlay";

const PANEL_COUNT = 3;
const HOME_INDEX = 1; // the user lands on the middle (home) panel

/**
 * The home is a three-panel vertical slider: hero / home / footer. The user
 * lands on the middle (home) panel; scrolling up eases to the hero, down to the
 * footer. A GSAP Observer intercepts wheel/touch and snaps a full viewport at a
 * time, locking input mid-transition. The persistent top bar lives outside the
 * transformed track so it stays put across all three panels. Inner pages don't
 * use this — they keep the curtain-reveal footer (see SiteFrame).
 */
export default function HomeSlider() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const index = useRef(HOME_INDEX);
  const animating = useRef(false);
  const goToRef = useRef<((i: number) => void) | null>(null);
  const reduced = useReducedMotion();
  // Which panel is showing — drives the top bar's colour (the hero is inverted,
  // so the bar has to flip to stay legible over it).
  const [active, setActive] = useState(HOME_INDEX);

  useGSAP(
    () => {
      // Land on the home panel, no animation.
      gsap.set(track.current, { yPercent: -100 * HOME_INDEX });

      const goTo = (i: number) => {
        const next = Math.max(0, Math.min(PANEL_COUNT - 1, i));
        if (next === index.current || animating.current) return;
        index.current = next;
        setActive(next);
        animating.current = true;
        gsap.to(track.current, {
          yPercent: -100 * next,
          duration: reduced ? 0 : 1,
          ease: "power3.inOut",
          onComplete: () => {
            // Hold the lock a beat past the tween to swallow trackpad/touch
            // momentum, so one gesture moves exactly one section.
            gsap.delayedCall(reduced ? 0 : 0.5, () => {
              animating.current = false;
            });
          },
        });
      };
      goToRef.current = goTo;

      // wheelSpeed -1 to match GSAP's section-snap convention: a downward
      // gesture (onUp) advances to the next/lower panel, upward (onDown) goes
      // back up. If it feels inverted, swap the two callbacks.
      const obs = Observer.create({
        target: window,
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 10,
        preventDefault: true,
        onUp: () => goTo(index.current + 1),
        onDown: () => goTo(index.current - 1),
      });

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "PageDown") goTo(index.current + 1);
        else if (e.key === "ArrowUp" || e.key === "PageUp") goTo(index.current - 1);
        else return;
        e.preventDefault();
      };
      window.addEventListener("keydown", onKey);

      return () => {
        obs.kill();
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: wrap, dependencies: [reduced] },
  );

  return (
    <div
      ref={wrap}
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <HomeTopBar onHome={() => goToRef.current?.(HOME_INDEX)} inverted={active === 0} />
      <div ref={track} className="absolute inset-0">
        {/* Grain lives per-panel on the hero + footer only — the home stays
            clean (no grain). */}
        <section className="absolute inset-x-0 h-full" style={{ top: "0%" }}>
          <Hero />
          <GrainOverlay />
        </section>
        <section className="absolute inset-x-0 h-full" style={{ top: "100%" }}>
          <FootprintsHome />
        </section>
        <section className="absolute inset-x-0 h-full" style={{ top: "200%" }}>
          <Footer variant="panel" />
          <GrainOverlay />
        </section>
      </div>
    </div>
  );
}
