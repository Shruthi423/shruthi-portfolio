"use client";

import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import { StickerPile } from "./StickerPile";

type Img = { f: string; w: number; h: number; l?: string };

const ILLUSTRATIONS: Img[] = [
  { f: "cheetah.png", w: 2480, h: 3508, l: "Speed demon" },
  { f: "lion.png", w: 2480, h: 3508, l: "Mane character" },
  { f: "masai_mara.png", w: 2480, h: 3508, l: "Wild thing" },
  { f: "tiger.png", w: 2480, h: 3508, l: "Here kitty" },
  { f: "lama.png", w: 2048, h: 2048, l: "No drama" },
  { f: "elephant.png", w: 2048, h: 2048, l: "Big mood" },
  { f: "penguins.png", w: 2048, h: 2048, l: "Tux squad" },
  { f: "seal.png", w: 2048, h: 2048, l: "Ocean baby" },
  { f: "ratty.png", w: 2400, h: 3800, l: "Cheese please" },
  { f: "tigertail.png", w: 2480, h: 3508, l: "Swish swish" },
  { f: "tail2.png", w: 2480, h: 3508, l: "Tail end" },
  { f: "cow.jpg", w: 2048, h: 2048, l: "Holy cow" },
  { f: "cow_2.png", w: 2048, h: 2048, l: "Moo-d" },
  { f: "dog.jpg", w: 2048, h: 2048, l: "Good boy" },
  { f: "donkey.jpg", w: 2048, h: 2048, l: "Hee haw" },
  { f: "meatball.png", w: 2048, h: 2048, l: "Saucy boy" },
  { f: "piano.png", w: 2048, h: 2048, l: "Key moment" },
  { f: "pool.png", w: 2048, h: 2048, l: "Dive in" },
  { f: "pixelfire.png", w: 1920, h: 1920, l: "All lit" },
  { f: "shy_tomatoes.png", w: 2360, h: 1640, l: "Blush mode" },
  { f: "fly.png", w: 1200, h: 1600, l: "Buzz off" },
  { f: "ny1.png", w: 1024, h: 1024, l: "Cathedral near home in nyc" },
];

const STICKERS: Img[] = [
  { f: "wolverine.png", w: 536, h: 536 },
  { f: "bear.png", w: 536, h: 536 },
  { f: "fox.png", w: 536, h: 536 },
  { f: "mouse.png", w: 536, h: 536 },
  { f: "rabbit.png", w: 536, h: 536 },
  { f: "squirrel.png", w: 536, h: 536 },
  { f: "funny-pumpkin.png", w: 536, h: 536 },
  { f: "m_maize_revised.png", w: 566, h: 566 },
  { f: "m_blue_revised.png", w: 566, h: 566 },
];

const prettify = (f: string) =>
  f
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Sticky-left text + scrolling-right content. */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 grid grid-cols-1 gap-8 lg:mt-28 lg:grid-cols-[1fr_2fr] lg:gap-12">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="font-heading text-h3 text-heading">{title}</h2>
        <p className="mt-2 font-mono text-caption-1 uppercase tracking-wide text-muted">
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}

/** Illustration card with a cursor-following 3D tilt. */
function Illustration({ img }: { img: Img }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) scale(1.04)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div data-reveal className="break-inside-avoid">
      <div
        ref={ref}
        data-cursor-label={img.l ?? prettify(img.f)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="overflow-hidden rounded-xl shadow-sm transition-transform duration-200 ease-out will-change-transform"
      >
        <Image
          src={`/playground/illustrations/${img.f}`}
          alt={`${prettify(img.f)} — illustration`}
          width={img.w}
          height={img.h}
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 45vw, 90vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

export default function Playground() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: "top 92%",
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-[1440px] px-10 pb-24 pt-32">
        <header className="text-center">
          <h1 className="font-heading text-h2 text-heading">The Playground</h1>
          <p className="mx-auto mt-3 w-full max-w-[34rem] text-balance font-body text-[15px] leading-relaxed text-muted md:text-[17px]">
            I illustrate what&rsquo;s around me, imperfect and hand-drawn,
            because that&rsquo;s where the real feeling is.
          </p>
        </header>

        {/* Illustrations — masonry */}
        <Section
          title="Illustrations"
          subtitle="Made on Procreate & Illustrator"
        >
          <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
            {ILLUSTRATIONS.map((img) => (
              <Illustration key={img.f} img={img} />
            ))}
          </div>
        </Section>

        {/* Stickers — uniform square grid */}
        <Section
          title="Stickers"
          subtitle="UMich mDining · Made in Illustrator"
        >
          <StickerPile stickers={STICKERS} />
        </Section>
      </div>
    </div>
  );
}
