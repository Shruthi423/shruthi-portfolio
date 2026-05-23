"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const SESSION_KEY = "shruthi-splash-seen";

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
 * First-load splash — name + tagline fade up word-by-word, then the whole
 * panel zooms through and fades to reveal the site. Plays once per session.
 */
export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 text-center"
          style={{ backgroundColor: "var(--bg)" }}
          initial={{ opacity: 1 }}
          exit={{ scale: 1.15, opacity: 0 }} // zoom-through
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.h1
              variants={word}
              className="font-display lowercase"
              style={{
                fontWeight: 700,
                fontSize: "clamp(3rem, 11vw, 8rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#963417", // terracota
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
                color: "#8a6f5e", // muted terracota-brown
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
