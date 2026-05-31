"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Body } from "matter-js";
import { gsap, useGSAP, SplitText } from "../lib/gsap";

export type Project = {
  name: string;
  discipline: string; // primary category
  type?: string; // Full-time / Internship / etc.
  year: string;
  description?: string; // one-line summary
  tags?: string[]; // bite-size pills that rain + pile in on hover
  color1: string; // card fill (light pastel)
  color2: string; // accent — solid pill fill
  image?: string; // floating mockup — wired in later
  imageFit?: "cover" | "contain"; // default "cover"; use "contain" for portrait mockups where the subject must show in full
  pillColors?: string[]; // override the auto-derived complement palette (e.g. for dark cards where complement-of-hue doesn't read)
  href?: string;
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

// Pills that complement the card's image: a trio sitting opposite the card's
// own hue (split-complement around 180°), so every pill pops against the
// background instead of melting into it. Held mid-dark + saturated so the
// white pill text stays legible.
function pillPalette(accent: string): string[] {
  const { h } = hexToHsl(accent);
  const comp = h + 180;
  const S = 66;
  const L = 44;
  const at = (deg: number) => `hsl(${Math.round((((deg % 360) + 360) % 360))} ${S}% ${L}%)`;
  return [at(comp - 48), at(comp), at(comp + 48)];
}

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [hovered, setHovered] = useState(false);

  // Per-pill spawn delay → asynchronous, rain-like entry. Stable across renders.
  const spawnDelays = useMemo(
    () => (project.tags ?? []).map(() => Math.random() * 0.4),
    [project.tags],
  );

  // Pill palette: per-project override wins; otherwise derived as a
  // split-complement trio opposite the card's hue.
  const palette = useMemo(
    () => project.pillColors ?? pillPalette(project.color2),
    [project.pillColors, project.color2],
  );

  useGSAP(
    () => {
      // Card rises + fades in as it enters the viewport.
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 48,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 88%" },
      });

      // Floating mockup drifts slower than the card — gentle parallax.
      // (Image-fill cards have no mockup, so only run when present.)
      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    },
    { scope: cardRef },
  );

  // Physics: on hover, pills drop from the top, collide, and pile up. The
  // Matter engine runs headless and we copy each body's position/angle onto the
  // real DOM pills, so they keep their text, font, and colour.
  useEffect(() => {
    if (!hovered) return;
    const frame = frameRef.current;
    const pills = pillRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!frame || pills.length === 0) return;

    const rect = frame.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const pad = 14;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion → lay pills out statically at the bottom, no animation.
    if (prefersReduced) {
      const gap = 8;
      let lineH = 0;
      pills.forEach((el) => (lineH = Math.max(lineH, el.offsetHeight)));
      let x = pad;
      let y = H - pad - lineH;
      pills.forEach((el) => {
        const w = el.offsetWidth;
        if (x + w > W - pad) {
          x = pad;
          y -= lineH + gap;
        }
        el.style.opacity = "1";
        el.style.transform = `translate(${x}px, ${y}px)`;
        x += w + gap;
      });
      return () => {
        pills.forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "";
        });
      };
    }

    let stopped = false;
    let rafId = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    (async () => {
      const Matter = await import("matter-js");
      if (stopped) return;
      const { Engine, Bodies, Composite, Body: MBody } = Matter;

      const engine = Engine.create();
      engine.gravity.y = 1.2;

      const t = 80; // wall thickness (kept off-screen)
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }), // floor
        Bodies.rectangle(-t / 2, H / 2, t, H * 3, { isStatic: true }), // left
        Bodies.rectangle(W + t / 2, H / 2, t, H * 3, { isStatic: true }), // right
      ]);

      const bodies: (Body | null)[] = pills.map(() => null);
      // Option B — "weighted bottom": a soft spring-damper rights each pill
      // toward upright every step, so they settle readable but keep wobbling.
      const TWO_PI = Math.PI * 2;
      const RIGHT_SPRING = 0.05; // pull toward upright
      const RIGHT_DAMP = 0.9; // angular damping (lower = more viscous)

      pills.forEach((el, i) => {
        const to = setTimeout(
          () => {
            if (stopped) return;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            const x = w / 2 + pad + Math.random() * Math.max(1, W - w - pad * 2);
            const body = Bodies.rectangle(x, -h - Math.random() * 60, w, h, {
              chamfer: { radius: h / 2 }, // pill (capsule) collision shape
              restitution: 0.7, // bouncy / rubbery landing
              friction: 0.3,
              frictionAir: 0.012,
              density: 0.0014,
            });
            MBody.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
            bodies[i] = body;
            Composite.add(engine.world, body);
            el.style.opacity = "1";
          },
          (spawnDelays[i] ?? 0) * 1000,
        );
        timeouts.push(to);
      });

      const tick = () => {
        if (stopped) return;
        // Weighted-bottom righting: spring each body toward the nearest upright.
        bodies.forEach((b) => {
          if (!b) return;
          const target = Math.round(b.angle / TWO_PI) * TWO_PI;
          const av =
            (b.angularVelocity + (target - b.angle) * RIGHT_SPRING) *
            RIGHT_DAMP;
          MBody.setAngularVelocity(b, av);
        });
        Engine.update(engine, 1000 / 60);
        pills.forEach((el, i) => {
          const b = bodies[i];
          if (!b) return;
          el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${b.position.y - el.offsetHeight / 2}px) rotate(${b.angle}rad)`;
        });
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      timeouts.forEach(clearTimeout);
      pills.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "";
      });
    };
  }, [hovered, spawnDelays]);

  // Title hover: letters lift in a quick left-to-right bouncy wave (SplitText).
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const split = new SplitText(el, { type: "chars" });
    gsap.set(split.chars, { display: "inline-block", willChange: "transform" });

    const onEnter = () => {
      gsap.to(split.chars, {
        keyframes: [
          { y: -12, duration: 0.18, ease: "power2.out" },
          { y: 0, duration: 0.4, ease: "elastic.out(1.05, 0.4)" },
        ],
        stagger: 0.035, // left-to-right wave
        overwrite: true,
      });
    };
    el.addEventListener("mouseenter", onEnter);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      gsap.killTweensOf(split.chars);
      split.revert();
    };
  }, []);

  const eyebrow = [project.discipline, project.type, project.year]
    .filter(Boolean)
    .join(" · ");

  const hasTags = !!project.tags && project.tags.length > 0;

  const visual = (
    // MOCKUP — Emma Wu wide stripe aspect (~2.7:1) + 2px corner radius.
    // Revert: aspect-[4/3] and drop rounded-[2px].
    <div
      ref={frameRef}
      data-cursor-label={project.href ? "VIEW" : "Coming soon"}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-[2px]"
      style={{ backgroundColor: project.color1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {project.image ? (
        // Cover-fill by default (landscape hero photos), or contain when the
        // mockup must show in full — set the card's `color1` to match the
        // image's edge colour and contained mockups read as floating on the bg.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image}
          alt={`${project.name} preview`}
          className={`absolute inset-0 h-full w-full transition-[filter] duration-500 ease-out group-hover:grayscale ${
            project.imageFit === "contain" ? "object-contain" : "object-cover"
          }`}
        />
      ) : (
        <div
          ref={mockupRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="w-[78%] transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.015]">
            {/* Placeholder "screen" — swapped for a real screenshot later. */}
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-white/95 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-black/10" />
                <span className="h-2 w-2 rounded-full bg-black/10" />
                <span className="h-2 w-2 rounded-full bg-black/10" />
              </div>
              <div className="space-y-2 p-4">
                <div className="h-2 w-1/2 rounded bg-black/10" />
                <div className="h-2 w-3/4 rounded bg-black/5" />
                <div className="h-2 w-2/3 rounded bg-black/5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pills — physics-driven: they rain from the top and pile up on hover. */}
      {hasTags && (
        <div className="pointer-events-none absolute inset-0">
          {project.tags!.map((tag, i) => (
            <span
              key={tag}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full px-4 py-2 font-mono text-caption-1 font-medium uppercase tracking-wide text-white opacity-0 will-change-transform"
              style={{ backgroundColor: palette[i % palette.length] }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const meta = (
    <div className="mt-4 flex flex-col items-start">
      <p className="font-mono text-caption-1 uppercase tracking-wide text-muted">
        {eyebrow}
      </p>
      <h3
        ref={titleRef}
        className="mt-1.5 inline-block font-heading text-h4 text-text"
      >
        {project.name}
      </h3>
      {project.description && (
        <p className="mt-1.5 font-body text-body text-muted">
          {project.description}
        </p>
      )}
    </div>
  );

  if (!project.href) {
    return (
      <div ref={cardRef} className="block">
        {visual}
        {meta}
      </div>
    );
  }

  return (
    <div ref={cardRef}>
      <Link href={project.href} className="block">
        {visual}
        {meta}
      </Link>
    </div>
  );
}
