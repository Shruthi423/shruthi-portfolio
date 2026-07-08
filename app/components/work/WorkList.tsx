"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/app/components/work/ProjectCard";

// One easing for every layout/height animation in the list so the reflow reads
// as a single smooth motion (rows gliding) instead of parts snapping at
// different rates. Long-ish + a soft ease-out settle.
const EASE = { duration: 0.42, ease: [0.22, 1, 0.36, 1] } as const;

// When a project is hovered the section floods with its accent, so the names
// must contrast with THAT accent, not the theme ink — in dark mode `--ink` is a
// light hue that all but vanishes on a light accent (the accessibility bug).
// Pick near-black or near-white from the accent's relative luminance.
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.5 ? "#1b1712" : "#faf7f1";
}

/**
 * The "index" view of the work — a stacked list of giant serif names. One
 * project is spotlighted at a time: its name goes ink while the rest dim, its
 * tag pills slide in just beneath it, its cover floats up into the bottom-right,
 * and (via `onActive`) the whole section floods with the project's accent.
 *
 * Desktop drives it by hover; touch has no hover, so the project nearest the
 * viewport centre auto-activates as you scroll (a guided spotlight). On touch
 * the pills + cover live in a fixed corner card so the list never reflows mid
 * scroll. Honors prefers-reduced-motion.
 */
export function WorkList({
  projects,
  onActive,
}: {
  projects: Project[];
  onActive?: (p: Project | null) => void;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const imgWrap = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const activeProject = active != null ? projects[active] ?? null : null;
  // While flooded, every name/description reads on the accent, so colour them
  // from the accent's luminance instead of the theme ink.
  const floodInk = activeProject?.accent ? readableOn(activeProject.accent) : null;

  useEffect(() => {
    onActive?.(activeProject);
  }, [activeProject, onActive]);

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // Touch: the name nearest the viewport centre is the active spotlight.
  useEffect(() => {
    if (!isTouch) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let best: number | null = null;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      // Only spotlight when the list is actually on screen — otherwise the
      // fixed corner card would linger over the hero/footer.
      setActive(bestDist > window.innerHeight * 0.6 ? null : best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isTouch, projects.length]);

  // Desktop: subtle parallax on the corner cover (no React re-render).
  useEffect(() => {
    if (isTouch || reduce) return;
    const onMove = (e: MouseEvent) => {
      const el = imgWrap.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * -18;
      const y = (e.clientY / window.innerHeight - 0.5) * -18;
      el.style.setProperty("--px", `${x.toFixed(1)}px`);
      el.style.setProperty("--py", `${y.toFixed(1)}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isTouch, reduce]);

  const Pills = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <motion.span
          key={t}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.03, ease: "easeOut" }}
          className="rounded-full px-3 py-1 font-mono text-caption-2 uppercase tracking-wide"
          style={{ backgroundColor: "var(--ink)", color: "var(--paper)" }}
        >
          {t}
        </motion.span>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <ul className="mx-auto flex w-full max-w-[1700px] flex-col px-5 sm:px-8">
        {projects.map((p, i) => {
          const isActive = i === active;
          const dim = active != null && !isActive;
          const Row = (
            <motion.div
              layout="position"
              transition={EASE}
              className="inline-flex flex-col items-start"
            >
              <span
                className="font-display leading-[1.04] transition-[opacity,color] duration-[400ms] ease-out"
                style={{
                  color: floodInk ?? "var(--ink)",
                  opacity: dim ? 0.5 : 1,
                  fontWeight: 400,
                  fontSize: "clamp(2rem, 6.4vw, 5.5rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                {p.name}
              </span>
              {/* Desktop: the one-liner + pills reveal inline beneath the active
                  name (description first, as a sneak peek, then the pills). */}
              {!isTouch && (
                <AnimatePresence initial={false}>
                  {isActive && (p.description || p.tags?.length) ? (
                    <motion.div
                      key="reveal"
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={EASE}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 pt-3">
                        {p.description ? (
                          <p
                            className="max-w-[46ch] font-body text-body"
                            style={{ color: floodInk ?? "var(--ink)", opacity: 0.82 }}
                          >
                            {p.description}
                          </p>
                        ) : null}
                        {p.tags?.length ? <Pills tags={p.tags} /> : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </motion.div>
          );

          return (
            <motion.li
              key={p.name}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              layout
              transition={EASE}
              onMouseEnter={() => !isTouch && setActive(i)}
              onMouseLeave={() => !isTouch && setActive(null)}
              className="py-4"
              // Soft hairline between projects — color-mixed off the ink so it
              // stays visible over whatever accent is flooding the section.
              style={
                i > 0
                  ? { borderTop: "1px solid color-mix(in srgb, var(--ink) 14%, transparent)" }
                  : undefined
              }
            >
              {p.href ? (
                <Link
                  href={p.href}
                  data-cursor-label={p.hoverLabel ?? "View"}
                  className="inline-block"
                >
                  {Row}
                </Link>
              ) : (
                <span data-cursor-label={p.hoverLabel ?? "Coming soon"} className="inline-block cursor-default">
                  {Row}
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>

      {/* The floating cover is portalled to <body> so `fixed` is viewport-
          relative — on the home the list lives inside ScrollSmoother's
          transformed container, which would otherwise trap a fixed element. */}
      {mounted &&
        createPortal(
          !isTouch ? (
            // Desktop: big cover floats up into the bottom-right (parallax).
            <div
              ref={imgWrap}
              className="pointer-events-none fixed bottom-0 right-6 z-40 sm:right-10"
              style={{ transform: "translate3d(var(--px,0), var(--py,0), 0)" }}
            >
              <AnimatePresence>
                {activeProject?.image ? (
                  <motion.div
                    key={activeProject.name}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 60 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0 right-0 w-[min(44vw,640px)] overflow-hidden rounded-t-2xl shadow-2xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeProject.image} alt={`${activeProject.name} preview`} className="block h-auto w-full" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            // Touch: a fixed corner card (cover + pills) that updates as you
            // scroll, so the list itself never reflows mid-scroll.
            <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-2">
              <AnimatePresence mode="popLayout">
                {activeProject ? (
                  <motion.div
                    key={activeProject.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex w-full flex-col items-end gap-2 text-right"
                  >
                    {activeProject.description ? (
                      <p
                        className="max-w-[34ch] font-body text-caption-1"
                        style={{ color: floodInk ?? "var(--ink)", opacity: 0.82 }}
                      >
                        {activeProject.description}
                      </p>
                    ) : null}
                    {activeProject.tags?.length ? <Pills tags={activeProject.tags.slice(0, 4)} /> : null}
                    {activeProject.image ? (
                      <div className="w-[52vw] max-w-[300px] overflow-hidden rounded-xl shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={activeProject.image} alt="" className="block h-auto w-full" />
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
