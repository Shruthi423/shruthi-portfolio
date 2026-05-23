"use client";

import Image from "next/image";
import { useRef } from "react";
import { Rock_Salt } from "next/font/google";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";

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
  { f: "main_image.jpeg", caption: "All smiles" },
];

// Hand-picked scatter so the pile looks tossed, not stacked dead-center.
const TILT = [-5, 4, -3, 6, -6, 3, -4, 5, -5, 4, -3, 6, -4]; // degrees
const OFFX = [0, 26, -30, 18, -22, 30, -16, 22, -28, 14, -20, 24, -12]; // x nudge
const OFFY = [0, -14, 12, -8, 16, -6, 10, -12, 14, -10, 8, -16, 6]; // y nudge

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

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-polaroid]");
      const track = root.current!;
      const mm = gsap.matchMedia();

      // Desktop + motion-OK → pinned stage; polaroids slide up onto a pile.
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
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

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.2, // buttery catch-up
            },
          });

          for (let i = 1; i < cards.length; i++) {
            tl.to(
              cards[i],
              { y: OFFY[i], opacity: 1, ease: "power2.out" },
              i - 1,
            );
          }

          return () => tl.scrollTrigger?.kill();
        },
      );

      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    // Tall scroll track — one screen of scroll per polaroid. The stage sticks
    // while the pile builds.
    <div
      ref={root}
      className="relative lg:h-[var(--track-h)]"
      style={
        { "--track-h": `${POLAROIDS.length * 80}vh` } as React.CSSProperties
      }
    >
      {/* DESKTOP — pinned pile */}
      <div className="sticky top-0 hidden h-screen lg:block">
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

      {/* MOBILE / reduced-motion — simple tilted column */}
      <div className="flex flex-col items-center gap-10 py-10 lg:hidden">
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
