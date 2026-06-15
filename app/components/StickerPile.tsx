"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Sticker = { f: string; w: number; h: number };

/**
 * Stickers drop from the top, collide, and pile up. On desktop you can grab and
 * throw them (Matter.js MouseConstraint). Engine runs headless and is mapped
 * onto the real DOM <Image> elements; it's lazy-loaded + only starts in view.
 */
export function StickerPile({ stickers }: { stickers: Sticker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = () => itemRefs.current.filter(Boolean) as HTMLDivElement[];

    // Reduced motion → lay stickers out in a calm static grid, no physics.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const list = els();
      const W = container.getBoundingClientRect().width;
      const size = list[0]?.offsetWidth ?? 100;
      const gap = 16;
      const perRow = Math.max(1, Math.floor((W + gap) / (size + gap)));
      list.forEach((el, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        el.style.opacity = "1";
        el.style.transform = `translate(${col * (size + gap)}px, ${row * (size + gap)}px)`;
      });
      return;
    }

    let stopped = false;
    let rafId = 0;
    let started = false;

    const start = async () => {
      if (started || stopped) return;
      started = true;
      const Matter = await import("matter-js");
      if (stopped) return;
      const { Engine, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;

      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const engine = Engine.create();
      engine.gravity.y = 1;

      const t = 120; // thick off-screen walls
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + t / 2, W + 2 * t, t, { isStatic: true }), // floor
        Bodies.rectangle(-t / 2, H / 2 - 300, t, H * 4, { isStatic: true }), // left
        Bodies.rectangle(W + t / 2, H / 2 - 300, t, H * 4, { isStatic: true }), // right
      ]);

      const list = els();
      const bodies = list.map((el, i) => {
        const size = el.offsetWidth;
        const r = size / 2;
        const x = r + Math.random() * Math.max(1, W - size);
        const y = -200 - Math.random() * 500 - i * 40; // staggered drop from above
        const body = Bodies.circle(x, y, r * 0.92, {
          restitution: 0.45, // a little bounce
          friction: 0.5,
          frictionAir: 0.012,
          density: 0.0012,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
        el.style.opacity = "1";
        return body;
      });
      Composite.add(engine.world, bodies);

      // Drag/throw — desktop pointers only, so touch scrolling stays smooth.
      if (window.matchMedia("(pointer: fine)").matches) {
        const mouse = Mouse.create(container);
        const mc = MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.2, render: { visible: false } },
        });
        Composite.add(engine.world, mc);
        // Don't hijack the wheel — let the page keep scrolling over the pile.
        const wheel = (mouse as unknown as { mousewheel: EventListener })
          .mousewheel;
        container.removeEventListener("wheel", wheel);
        container.removeEventListener("mousewheel", wheel);
        container.removeEventListener("DOMMouseScroll", wheel);
      }

      const tick = () => {
        if (stopped) return;
        Engine.update(engine, 1000 / 60);
        list.forEach((el, i) => {
          const b = bodies[i];
          el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${b.position.y - el.offsetHeight / 2}px) rotate(${b.angle}rad)`;
        });
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    // Only spin up the engine once the pile scrolls into view.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.15 },
    );
    io.observe(container);

    return () => {
      stopped = true;
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [stickers]);

  return (
    <div
      ref={containerRef}
      data-cursor-label="drag me"
      className="relative h-[440px] w-full overflow-hidden md:h-[600px]"
    >
      {stickers.map((s, i) => (
        <div
          key={s.f}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-[132px] w-[132px] opacity-0 will-change-transform md:h-[184px] md:w-[184px]"
        >
          <Image
            src={`/the-lab/stickers/${s.f}`}
            alt={`${s.f.replace(/\.[^.]+$/, "")} sticker`}
            width={s.w}
            height={s.h}
            sizes="184px"
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-contain"
          />
        </div>
      ))}
    </div>
  );
}
