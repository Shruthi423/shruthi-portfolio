"use client";

import Image from "next/image";
import { useRef } from "react";
import { Rock_Salt } from "next/font/google";
import { gsap, useGSAP } from "@/app/lib/gsap";

// Rock Salt — handwritten polaroid caption (next/font, not the raw <link>).
const rockSalt = Rock_Salt({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const INK = "#3b2a1c"; // espresso — the handwriting

// focus = CSS object-position; zoom = extra scale to push in on the subject.
type Polaroid = { f: string; caption: string; focus?: string; zoom?: number };

const POLAROIDS: Polaroid[] = [
  { f: "safari2.jpeg", caption: "Hii! That's me" },
  { f: "graduated.jpeg", caption: "Graduate of 2026" },
  { f: "swim1.jpeg", caption: "My happy place" },
  { f: "baking.jpeg", caption: "I love to experiment with food" },
  { f: "fun.jpeg", caption: "fishy coke cans" },
  { f: "safari1.jpeg", caption: "I went on a safari last December" },
  { f: "lions.jpeg", caption: "Loved every second of it" },
  { f: "giraffe.jpeg", caption: "First time seeing a giraffe!", focus: "right center" },
  { f: "sky1.jpeg", caption: "I like keeping a collection of rainbows" },
  { f: "sky2.jpeg", caption: "look up" },
  { f: "snow1.jpeg", caption: "I love Michigan winters" },
  { f: "cycle.jpeg", caption: "Recently moved to the bay" },
];

// Hand-picked scatter so the pile looks tossed, not stacked dead-center.
const TILT = [-5, 4, -3, 6, -6, 3, -4, 5, -5, 4, -3, 6, -4]; // degrees
const OFFX = [0, 26, -30, 18, -22, 30, -16, 22, -28, 14, -20, 24, -12]; // x nudge
const OFFY = [0, -14, 12, -8, 16, -6, 10, -12, 14, -10, 8, -16, 6]; // y nudge

// The one place that decides "interactive pinned pile" vs "plain column". Mouse
// or trackpad only (touch screens — even big tablets — get the column), and
// never under reduced-motion. CSS below + the GSAP matchMedia use this verbatim,
// so the layout shown and the behaviour wired up can never disagree.
const INTERACTIVE_MQ =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// Pure-CSS layout switch — no JS, so it's correct on the server (no flash) and
// touch devices are physically incapable of landing on the scroll-jacked stage.
const STYLES = `
.ps-stage { display: none; }
.ps-stack { display: flex; }
@media ${INTERACTIVE_MQ} {
  .ps-stage { display: block; }
  .ps-stack { display: none; }
}
`;

function Card({ p }: { p: Polaroid }) {
  return (
    <div className="bg-white p-3 pb-12 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ece8e0]">
        <Image
          src={`/about/${p.f}`}
          alt={p.caption}
          fill
          sizes="(min-width: 1024px) 30vw, 80vw"
          className="object-cover"
          style={{
            objectPosition: p.focus,
            transform: p.zoom ? `scale(${p.zoom})` : undefined,
            transformOrigin: p.focus ?? "center",
          }}
          priority={p.f === POLAROIDS[0].f}
        />
      </div>
      <p
        className={`${rockSalt.className} mt-4 text-center text-[clamp(1rem,1.5vw,1.35rem)] leading-none`}
        style={{ color: INK }}
      >
        {p.caption}
      </p>
    </div>
  );
}

export default function PhotoStory() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop pointer + motion-OK → the right panel is a self-contained,
      // hover-to-flip pile. Wheel over it advances/reverses the stack while the
      // page stays put; at either end it lets the wheel through so the reader is
      // never trapped. Scrolling over the left column never reaches this — that
      // stays plain page scroll.
      mm.add(INTERACTIVE_MQ, () => {
        const stageEl = stage.current;
        if (!stageEl) return;
        const cards = gsap.utils.toArray<HTMLElement>("[data-polaroid]", stageEl);
        if (!cards.length) return;

        const below = Math.max(window.innerHeight, 800);
        cards.forEach((c, i) => {
          gsap.set(c, {
            xPercent: -50,
            yPercent: -50,
            x: OFFX[i],
            y: i === 0 ? OFFY[i] : below, // first rests, rest wait below
            rotation: TILT[i],
            opacity: i === 0 ? 1 : 0,
            zIndex: i,
          });
        });

        // Paused timeline = the pile build, but driven by our own progress
        // value instead of by page-scroll position.
        const tl = gsap.timeline({ paused: true });
        for (let i = 1; i < cards.length; i++) {
          tl.to(cards[i], { y: OFFY[i], opacity: 1, ease: "power2.out", duration: 1 }, i - 1);
        }

        const STEP = Math.max(190, Math.round(window.innerHeight * 0.28)); // wheel px per photo
        const maxAcc = (cards.length - 1) * STEP;
        const EPS = 0.5;
        let acc = 0; // accumulated wheel within [0, maxAcc]

        const onWheel = (e: WheelEvent) => {
          // Only capture once the panel is actually pinned full-height; before
          // that, let the page scroll it into place.
          const rect = stageEl.getBoundingClientRect();
          const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight;
          if (!pinned) return;

          let dy = e.deltaY;
          if (e.deltaMode === 1) dy *= 16; // lines → px
          else if (e.deltaMode === 2) dy *= window.innerHeight; // pages → px

          const atStart = acc <= EPS;
          const atEnd = acc >= maxAcc - EPS;
          // hand the wheel back to the page at the ends
          if ((dy > 0 && atEnd) || (dy < 0 && atStart)) return;

          e.preventDefault();
          acc = Math.min(maxAcc, Math.max(0, acc + dy));
          gsap.to(tl, {
            progress: acc / maxAcc,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
          });
        };

        stageEl.addEventListener("wheel", onWheel, { passive: false });
        return () => {
          stageEl.removeEventListener("wheel", onWheel);
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <style>{STYLES}</style>

      {/* DESKTOP (mouse / trackpad) — pinned, scroll-to-flip pile */}
      <div ref={stage} className="ps-stage sticky top-0 h-screen overflow-hidden">
        {POLAROIDS.map((p) => (
          <div
            key={p.f}
            data-polaroid
            className="absolute left-1/2 top-1/2 w-[clamp(300px,34vw,480px)] will-change-transform"
          >
            <Card p={p} />
          </div>
        ))}
      </div>

      {/* MOBILE / touch / reduced-motion — simple tilted column, plain scroll */}
      <div className="ps-stack flex-col items-center gap-10 px-4 py-12 sm:gap-12">
        {POLAROIDS.map((p, i) => (
          <div
            key={p.f}
            className="w-[min(86vw,420px)]"
            style={{ transform: `rotate(${TILT[i]}deg)` }}
          >
            <Card p={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
