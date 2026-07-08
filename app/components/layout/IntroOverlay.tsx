"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { isSplashLifted, liftSplash, splashWillPlay } from "@/app/lib/splash";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOLD_MS = 1600; // how long the splash dwells before it lifts (plays every refresh, so keep it brief)

// Words reveal one at a time — offset + delay, blur→sharp (the Zajno softness).
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const SUBTITLE = ["a", "multidisciplinary", "designer"];

/**
 * Home-only splash — name + tagline fade up word-by-word, then the panel lifts
 * (zoom + fade) to reveal the home. Plays on every fresh load/refresh of the
 * home page (not on inner pages, and not on client-side navigation into home).
 * The moment it lifts it calls liftSplash() so the home reveals in sync.
 */
export function IntroOverlay() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  // SSR-consistent: server + client agree on the path, so no hydration flash.
  const [visible, setVisible] = useState(onHome);

  useEffect(() => {
    if (!onHome) return;
    // Only a fresh full load of home plays the splash. A client-side nav into
    // home (or a load that already lifted) should reveal the home immediately.
    if (isSplashLifted() || !splashWillPlay()) {
      setVisible(false);
      liftSplash();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      liftSplash();
      return;
    }
    const t = window.setTimeout(() => {
      setVisible(false); // begins the lift
      liftSplash(); // home reveals in sync with the lift
    }, HOLD_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHome]);

  if (!onHome) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 text-center"
          style={{ backgroundColor: "var(--bg)" }}
          initial={{ opacity: 1 }}
          exit={{ scale: 1.06, opacity: 0, filter: "blur(4px)" }} // lift away
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.h1
              variants={word}
              className="font-display lowercase"
              style={{
                fontWeight: 500,
                fontStyle: "italic", // matches the home's big links
                fontSize: "clamp(3rem, 11vw, 8rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--text)", // the ink — flips with paper/polarity
              }}
            >
              Shruthi
            </motion.h1>

            <p
              className="mt-5 flex flex-wrap justify-center gap-x-[0.3em]"
              style={{
                fontFamily: "var(--font-figtree)",
                fontSize: "clamp(0.9rem, 2.2vw, 1.4rem)",
                letterSpacing: "0.01em",
                color: "var(--muted)", // ink-tinted muted
              }}
            >
              {SUBTITLE.map((w) => (
                <motion.span key={w} variants={word} className="inline-block">
                  {w}
                </motion.span>
              ))}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
