"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * First-load intro — an Oat Milk panel with the name, which then lifts
 * away like a curtain to reveal the site (echoes the footer reveal).
 */
export function IntroOverlay() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 1700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "var(--bg)" }}
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <motion.span
            className="font-display text-h2"
            style={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#3a7d3a",
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            Shruthi
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
