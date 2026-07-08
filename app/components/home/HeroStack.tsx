"use client";

import { useEffect, useRef } from "react";
import { isSplashLifted, onSplashLift, splashWillPlay } from "@/app/lib/splash";

/**
 * Wake-reveal hero. The statement sits faint — like fresh, unwalked ground — and
 * ignites word by word in the trail the visitor's cursor leaves, paying off the
 * site's footprint motif: you literally reveal the intro by walking across it.
 *
 * Guardrails so it never traps the copy: the remaining words auto-reveal after a
 * short idle, and on touch / reduced-motion the whole line simply fades in. The
 * reveal is driven by raw cursor proximity (the footprints already follow that
 * same path), so it stays decoupled from the print engine. data-quiet keeps
 * prints from spawning over the text so it stays readable.
 */

const WORDS =
  "A multidisciplinary designer who loves storytelling, craft, and making products easy to use.".split(
    " ",
  );

// px radius around the cursor that lights a word — roughly one footfall's reach.
const REACH = 120;
// ms of stillness after which the remaining words reveal themselves.
const IDLE_MS = 1900;

export default function HeroStack() {
  const scope = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".hero-word"));
    if (!words.length) return;

    const revealed = new Set<number>();
    let raf = 0;
    let idle: number | undefined;
    let hintShown = true;

    const hideHint = () => {
      if (!hintShown) return;
      hintShown = false;
      if (hintRef.current) hintRef.current.style.opacity = "0";
    };

    function cleanup() {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(idle);
      if (raf) cancelAnimationFrame(raf);
    }

    const light = (i: number) => {
      if (revealed.has(i)) return;
      revealed.add(i);
      const el = words[i];
      el.style.opacity = "1";
      el.style.transform = "translateY(0) scale(1)";
      if (revealed.size === words.length) cleanup();
    };

    // Stagger the leftovers so an idle / touch reveal still reads as a walk.
    const revealAll = () =>
      words.forEach((_, i) => setTimeout(() => light(i), i * 55));

    const onMove = (e: MouseEvent) => {
      hideHint();
      window.clearTimeout(idle);
      idle = window.setTimeout(revealAll, IDLE_MS);
      if (raf) return;
      const { clientX: cx, clientY: cy } = e;
      raf = requestAnimationFrame(() => {
        raf = 0;
        for (let i = 0; i < words.length; i++) {
          if (revealed.has(i)) continue;
          const r = words[i].getBoundingClientRect();
          const dx = cx - (r.left + r.width / 2);
          const dy = cy - (r.top + r.height / 2);
          if (dx * dx + dy * dy < REACH * REACH) light(i);
        }
      });
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;

    const start = () => {
      if (reduce || noHover) {
        hideHint();
        revealAll();
        return;
      }
      window.addEventListener("mousemove", onMove);
      // A touch longer before the FIRST auto-reveal, to give a still visitor a
      // beat to notice the invitation and move.
      idle = window.setTimeout(revealAll, IDLE_MS + 900);
    };

    let offSplash: (() => void) | undefined;
    if (!splashWillPlay() || isSplashLifted()) start();
    else
      offSplash = onSplashLift(() => {
        start();
        offSplash?.();
      });

    return () => {
      cleanup();
      offSplash?.();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-6">
      <p
        ref={scope}
        data-quiet
        className="flex max-w-[18ch] flex-wrap justify-center gap-x-[0.3em] gap-y-[0.08em] text-center"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontStyle: "italic",
          letterSpacing: "-0.01em",
          lineHeight: 1.12,
          fontSize: "clamp(1.7rem, 5vw, 3.4rem)",
          color: "var(--ink)",
        }}
      >
        {WORDS.map((w, i) => (
          <span
            key={i}
            className="hero-word inline-block"
            style={{
              opacity: 0.22,
              transform: "translateY(0.06em) scale(0.985)",
              transition:
                "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "opacity, transform",
            }}
          >
            {w}
          </span>
        ))}
      </p>

      <span
        ref={hintRef}
        data-quiet
        className="font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "var(--ink)", opacity: 0.5, transition: "opacity 0.5s ease" }}
      >
        move to leave a trail
      </span>
    </div>
  );
}
