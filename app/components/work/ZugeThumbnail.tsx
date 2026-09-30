"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/app/lib/gsap";

const N = 17; // bars
const CX = 800;
const CY = 610;
const R = 340;
const W = 28;
const H = 90;
const GAP = 58;
const LIT = 11; // bars lit when the gauge is "riding"
// Playback rate for the whole loop. The timeline is authored at 1x (~8.9s a
// cycle), which outlasts a typical hover, so it plays back faster than written.
// Raise to speed the loop up further, lower to slow it down.
const SPEED = 1.6;

const ECO = "#339551";
const OFF = "#BFD8AE";
const PINE = "#084734";
const TOP = 80;   // the scale's upper bound, matching the dashboard's own gauge
const CRUISE = 34; // the speed the gauge settles at while "riding", matching the Drive screen

type Pose = { x: number; y: number; r: number };

// Live thumbnail for the Zuge card (ported from the standalone
// Zuge_images/zuge-thumbnail.html prototype). At rest it's the gauge sitting
// still with its lit bars; while `active` (hover, or on screen on touch) the
// gauge unrolls into a voice waveform, listens, and curls back. Reduced motion
// never moves.
export function ZugeThumbnail({ active }: { active: boolean }) {
  const groupRef = useRef<SVGGElement>(null);
  const readoutRef = useRef<SVGTextElement>(null);
  const dialRef = useRef<SVGGElement>(null);
  // Set up once; the `active` effect below drives play/pause.
  const playRef = useRef<(on: boolean) => void>(() => {});

  useEffect(() => {
    const root = groupRef.current;
    if (!root) return;

    const NS = "http://www.w3.org/2000/svg";
    const bars: { el: SVGRectElement; arc: Pose; wave: Pose; s: Pose }[] = [];

    for (let i = 0; i < N; i++) {
      const a = 210 - (240 * i) / (N - 1);
      const rad = (a * Math.PI) / 180;
      const arc: Pose = { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad), r: 90 - a };
      const wave: Pose = { x: CX + (i - (N - 1) / 2) * GAP, y: CY - 100, r: 0 };
      const el = document.createElementNS(NS, "rect");
      el.setAttribute("width", String(W));
      el.setAttribute("rx", String(W / 2));
      el.setAttribute("fill", OFF);
      root.appendChild(el);
      bars.push({ el, arc, wave, s: { ...arc } });
    }

    // voice: a smooth travelling wave, scaled by `amp` (0 = still, 1 = speaking)
    const voice = { amp: 0, phase: 0 };
    // the speed shown in the middle of the dial, animated with the arc
    const speed = { v: 0 };

    const draw = () => {
      const out = readoutRef.current;
      if (out) out.textContent = String(Math.round(speed.v));
      for (let i = 0; i < N; i++) {
        const b = bars[i];
        const { x, y, r } = b.s;
        const env = 1 - Math.pow(Math.abs(i - (N - 1) / 2) / ((N - 1) / 2), 2) * 0.7;
        const w =
          Math.sin(voice.phase + i * 0.55) * 0.5 + Math.sin(voice.phase * 1.7 - i * 0.9) * 0.5;
        const h = H + voice.amp * env * (60 + 90 * w);
        b.el.setAttribute("height", String(h));
        b.el.setAttribute("x", String(-W / 2));
        b.el.setAttribute("y", String(-h / 2));
        b.el.setAttribute("transform", `translate(${x} ${y}) rotate(${r})`);
      }
    };
    draw();

    const cleanupBars = () => {
      bars.forEach((b) => b.el.remove());
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bars.forEach((b, i) => b.el.setAttribute("fill", i < LIT ? ECO : OFF));
      speed.v = CRUISE;
      draw();
      return cleanupBars;
    }

    // The resting frame: bars back on the arc, the first LIT of them charged.
    const rest = () => {
      bars.forEach((b, i) => {
        Object.assign(b.s, b.arc);
        b.el.setAttribute("fill", i < LIT ? ECO : OFF);
      });
      voice.amp = 0;
      speed.v = CRUISE;
      draw();
    };
    rest();

    const ctx = gsap.context(() => {
      const phase = gsap.to(voice, {
        phase: Math.PI * 2 * 6,
        duration: 12,
        ease: "none",
        repeat: -1,
        paused: true,
      });

      const tl = gsap.timeline({ repeat: -1, paused: true });

      // One rate for both, so the waveform stays in step with the unroll.
      tl.timeScale(SPEED);
      phase.timeScale(SPEED);

      const els = bars.map((b) => b.el);
      const st = bars.map((b) => b.s);
      const E = "sine.inOut";

      tl
        // riding: the needleless dial sweeps up to cruising speed as it fills
        .to(els.slice(0, LIT), { attr: { fill: ECO }, duration: 0.5, stagger: 0.09, ease: E }, 0)
        .fromTo(speed, { v: 0 }, { v: CRUISE, duration: 1.5, ease: "power2.out" }, 0)
        // the gauge becomes a waveform
        .to(
          st,
          {
            x: (i: number) => bars[i].wave.x,
            y: (i: number) => bars[i].wave.y,
            r: 0,
            duration: 1.4,
            ease: "power2.inOut",
            stagger: { each: 0.03, from: "center" },
          },
          2.0,
        )
        .to(els, { attr: { fill: PINE }, duration: 1, ease: E }, 2.3)
        // the speed readout steps aside while the dial is listening
        .to(dialRef.current, { autoAlpha: 0, duration: 0.5, ease: E }, 2.0)
        // listening
        .to(voice, { amp: 1, duration: 0.8, ease: E }, 3.2)
        .to(voice, { amp: 0, duration: 0.8, ease: E }, 5.4)
        // back to the gauge
        .to(
          st,
          {
            x: (i: number) => bars[i].arc.x,
            y: (i: number) => bars[i].arc.y,
            r: (i: number) => bars[i].arc.r,
            duration: 1.4,
            ease: "power2.inOut",
            stagger: { each: 0.03, from: "edges" },
          },
          6.0,
        )
        .to(els, { attr: { fill: (i: number) => (i < LIT ? ECO : OFF) }, duration: 1, ease: E }, 6.4)
        .to(dialRef.current, { autoAlpha: 1, duration: 0.5, ease: E }, 6.6)
        // rest, then fade the fill out so the loop restarts without a jump
        .to(
          els.slice(0, LIT).reverse(),
          { attr: { fill: OFF }, duration: 0.5, stagger: 0.06, ease: E },
          8.4,
        );

      playRef.current = (on: boolean) => {
        if (on) {
          gsap.ticker.add(draw);
          tl.invalidate().restart();
          phase.play();
        } else {
          tl.pause();
          phase.pause();
          gsap.ticker.remove(draw);
          rest();
        }
      };
    });

    return () => {
      playRef.current = () => {};
      gsap.ticker.remove(draw);
      ctx.revert();
      cleanupBars();
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    playRef.current(true);
    return () => playRef.current(false);
  }, [active]);

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A speed gauge turns into a voice waveform and back: the dashboard that listens"
      className="absolute inset-0 block h-full w-full"
    >
      <defs>
        <radialGradient id="zuge-thumb-bg" cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor="#F6FCF1" />
          <stop offset="1" stopColor="#D6EFC3" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#zuge-thumb-bg)" />
      <g ref={groupRef} />
      {/* The dial's readout. The bars are the arc; these say what the arc measures. */}
      <g ref={dialRef} fontFamily="var(--font-body)" textAnchor="middle">
        <text
          ref={readoutRef}
          x={CX}
          y={CY + 30}
          fontSize="210"
          fontWeight="700"
          letterSpacing="-6"
          fill={PINE}
        >
          {CRUISE}
        </text>
        <text x={CX} y={CY + 110} fontSize="58" fontWeight="500" fill={PINE} opacity="0.65">
          km/h
        </text>
        <text x={CX - R + 10} y={CY + 240} fontSize="46" fontWeight="500" fill={PINE} opacity="0.5">
          0
        </text>
        <text x={CX + R - 10} y={CY + 240} fontSize="46" fontWeight="500" fill={PINE} opacity="0.5">
          {TOP}
        </text>
      </g>
    </svg>
  );
}
