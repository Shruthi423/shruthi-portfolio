"use client";

import { useEffect, useRef, useState } from "react";

const TEXT = "Amuse-bouche";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Live thumbnail for the Amuse-bouche card (ported from the standalone
// amuse-bouche-cover.html prototype). At rest it's the still florals under the
// finished title; while `active` (hover, or on screen on touch) the image drifts
// and the title types itself in and out on a loop. Reduced motion never moves.
export function AmuseBoucheThumbnail({ active }: { active: boolean }) {
  const [typed, setTyped] = useState(TEXT);
  const [typing, setTyping] = useState(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    aliveRef.current = true;
    setTyped("");

    (async () => {
      while (aliveRef.current) {
        await wait(700);
        if (!aliveRef.current) return;
        setTyping(true);
        for (let i = 1; i <= TEXT.length; i++) {
          setTyped(TEXT.slice(0, i));
          await wait(95 + Math.random() * 70);
          if (!aliveRef.current) return;
        }
        setTyping(false);
        await wait(3600);
        if (!aliveRef.current) return;
        setTyping(true);
        for (let i = TEXT.length - 1; i >= 0; i--) {
          setTyped(TEXT.slice(0, i));
          await wait(40);
          if (!aliveRef.current) return;
        }
        setTyping(false);
      }
    })();

    return () => {
      // Back to the resting frame: the whole title, no caret.
      aliveRef.current = false;
      setTyping(false);
      setTyped(TEXT);
    };
  }, [active]);

  return (
    <div
      className={`amuse-cover${active ? " is-playing" : ""}`}
      role="img"
      aria-label="Amuse-bouche"
    >
      <div className="amuse-cover__bg" />
      <div className="amuse-cover__shade" />
      <h3 className="amuse-cover__title font-display">
        {/* A hidden copy of the full string holds the line's width so the
            typing never nudges the centred title left and right. */}
        <span className="invisible" aria-hidden="true">
          {TEXT}
        </span>
        <span className="absolute left-0 top-0">
          {typed}
          {active && <span className={`amuse-cover__caret${typing ? " is-typing" : ""}`} />}
        </span>
      </h3>
    </div>
  );
}
