"use client";

import { useCallback, useEffect, useState } from "react";

import FootprintsHome from "@/app/components/home/FootprintsHome";
import RotatingWord from "@/app/components/home/RotatingWord";

/**
 * The hero: the headline standing on live ground.
 *
 * The backdrop is the same footprint engine the footer runs
 * (`FootprintsHome`), but in its "cross" greeting: a walker enters off the
 * left edge and crosses the full width along a slow arc through the lower
 * third. The box is a whole viewport now, and four prints scuffed into a
 * corner (the footer's greeting) left the screen looking dead until the
 * pointer moved. It sits on the page's own paper (no `inverted`), so the hero
 * reads as part of the page rather than a panel the way the footer does. It
 * stops a little short of a full viewport so the work below shows at the
 * bottom edge and the page reads as having somewhere to go.
 *
 * The headline's first word is alive: <RotatingWord /> cycles it through eight
 * verbs while the tail ("how humans meet AI.") stays fixed. Each verb owns a
 * hue and a motion of its own, and its slot is pinned to the widest word, so
 * the sentence holds exactly one length and nothing around it ever moves,
 * however far a letter travels to get there.
 *
 * That colour is the hinge between the two systems. The live hue rides back up
 * here as `tint` and straight into the footprint canvas, so when the verb turns
 * orange the prints mix orange with it. Charcoal reports null, which lets the
 * trail roll its own blends again — so the coupling reveals itself on the
 * coloured words and relaxes on the resting one.
 *
 * There is deliberately no picker here: the footer holds the only one, and the
 * choice is shared + persisted in FootprintProvider, so picking there changes
 * the hero too.
 */

/** The sentence's entrance, and the head start the verb gets before it starts
 *  turning over — the line should land before anything moves.
 *
 *  The order is: the headline fades up over ENTRANCE_MS with the verb's slot
 *  held empty, then "Designing" writes itself into it in script, then the
 *  first flip. FIRST_HOLD_MS is one full dwell, so the opening word gets to
 *  be read after it finishes being written rather than swapping the moment
 *  the last letter lands. */
const ENTRANCE_MS = 1000;
const FIRST_HOLD_MS = 2200;

export default function HeroStack() {
  const [tint, setTint] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  // Identity-stable so RotatingWord's publish effect doesn't re-fire on every
  // parent render.
  const onTint = useCallback((hue: string | null) => setTint(hue), []);

  // One frame after mount, so the transition has an "off" state to leave.
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative isolate min-h-[88svh] w-full overflow-hidden">
      <FootprintsHome tint={tint} introWalk="cross">
        <section
          aria-labelledby="hero-title"
          className="flex h-full w-full items-center justify-center px-6"
        >
          <h1
            id="hero-title"
            // data-quiet keeps the engine from stamping prints over the
            // sentence: the walker's arc passes below it, and anything that
            // strays near fades out through quietFactor.
            data-quiet
            /* Sized off the viewport rather than --text-h1: the whole
               sentence has to hold one line down to phone width, and the
               slot is pinned to "Prototyping", so that is the one length the
               clamp is tuned against. */
            className="max-w-full whitespace-nowrap text-center text-[clamp(1.15rem,6vw,3.25rem)] font-display font-normal leading-[1.12] tracking-[-0.025em] text-text transition-[opacity,transform,filter] ease-slow"
            style={{
              transitionDuration: `${ENTRANCE_MS}ms`,
              opacity: entered ? 1 : 0,
              // Rises and sharpens into place, like it is being set rather
              // than switched on.
              transform: entered ? "translateY(0)" : "translateY(0.22em)",
              filter: entered ? "blur(0px)" : "blur(6px)",
            }}
          >
            {/* The whole sentence, once, for screen readers and for anything
                parsing the page — the visual version below is decorative. */}
            <span className="sr-only">Designing how humans meet AI.</span>
            <span aria-hidden="true">
              <RotatingWord
                startDelayMs={ENTRANCE_MS + FIRST_HOLD_MS}
                armDelayMs={ENTRANCE_MS}
                onTint={onTint}
              />{" "}
              how humans meet AI.
            </span>
          </h1>
        </section>
      </FootprintsHome>
    </div>
  );
}
