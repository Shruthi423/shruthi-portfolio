"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import VerbDoodle from "@/app/components/home/VerbDoodles";
import { INK_HUES, SURFACE } from "@/app/lib/footprints";

/**
 * The verb at the head of the hero, which will not sit still.
 *
 * The sentence is "<verb> how humans meet AI." on one line — the tail is
 * fixed, the verb cycles. Eight words, and each one owns two things nothing
 * else in the list has: a hue, and a motion. The motion is chosen to mean the
 * word (the letters of "Prototyping" are dealt scrambled and trade places
 * until they spell it, a knot resolves for "Untangling") rather than to decorate it, which is the whole reason there
 * are eight and not fifteen: the list was cut back until every word was doing
 * a different job. Five near-synonyms for thinking, each with its own
 * animation, read as a component showing off.
 *
 * Four rules the implementation exists to keep:
 *
 *  - The sentence never changes length, and no effect may change it either.
 *    Every word is measured and the slot is pinned to the widest of them for
 *    good; short words get symmetric air rather than dragging "meet AI." left
 *    and right. Every effect is therefore transform or opacity only —
 *    nothing that touches layout, so a letter can fly in from half an em away
 *    without the tail moving a pixel. (Sizing the slot to the live word
 *    instead was tried and reverted: the words are stacked in one grid cell,
 *    so a slot narrower than the longest of them lets every other word spill
 *    out of it, and mid-crossfade the outgoing word sits on top of "how
 *    humans".)
 *  - Only the darkened tier of the palette is readable here. Lavender, lime
 *    and the blues sit near 1.9:1 on the #fafaf8 paper as raw palette values,
 *    which would make the sentence's own subject the hardest thing on the
 *    page. INK_HUES in app/lib/footprints holds the variants that survive
 *    being set at display size — the same values the case studies already use
 *    for their typographic accents — so eight words get eight hues and none
 *    of them drops out of legibility.
 *  - The effect belongs to the incoming word only; every exit is identical
 *    (fade out, settle back down). One surprise per flip. Eight entrances and
 *    eight exits would be noise.
 *  - Reduced motion gets the resting word, in Ovo, fully written, with no
 *    timer and no effect at all. A headline that rewrites itself every couple
 *    of seconds is exactly what that setting is for.
 *
 * The hues come from lib rather than the CSS custom properties because they
 * are handed back up via `onTint` to steer the footprint blends, and canvas
 * and SVG can't resolve a var(). That file is the palette's source of truth
 * for exactly this reason.
 *
 * Every word is rendered at once, stacked in a single grid cell, and only
 * opacity and transform change — that buys a true crossfade with no
 * flash of empty slot. It also means effects are built out of transitions
 * wherever possible: a transition re-runs by itself every time a word comes
 * back around, where a finite animation on a never-unmounted element would
 * need restarting. The two that can't be transitions (a drift and a ripple
 * that continue for as long as the word holds) are infinite keyframes in
 * globals.css instead.
 */

/**
 * The eight motions. Each one is named for the word it belongs to, not for
 * what it does to the DOM.
 *
 *  typeset  — every letter starts at its own angle and is slowly set straight
 *  anagram  — the letters are dealt in the wrong order, then trade places
 *             until the word is spelled right
 *  think    — the word drifts, and one letter floats off above the line, hangs
 *             there like a thought, and drops back into its slot
 *  wave     — letters bounce up in a travelling crest, squashing as they land
 *  untangle — letters arrive spun most of the way round, unwinding from one end
 *  drop     — letters fall in from above the line and bounce on the way in
 *  jelly    — the word is kneaded: squashed, then wobbled through four
 *             decreasing overshoots
 *  glitch   — letters jump in hard frames, flickering, then lock solid
 *
 * The amplitudes are deliberately large. An earlier pass kept every effect
 * under about 0.2em and it read as interface polish rather than as character —
 * the same gesture eight times over, at a size nobody remembers. These travel
 * three to four times as far, overshoot rather than ease, and each one commits
 * to a single property instead of nudging three.
 */
type Effect =
  | "typeset"
  | "anagram"
  | "think"
  | "wave"
  | "untangle"
  | "drop"
  | "jelly"
  | "glitch";

type Verb = {
  word: string;
  /** Palette hue, from INK_HUES — the readable-at-display-size tier. */
  color: string;
  effect: Effect;
};

// Ink is the page's own text colour, not a palette hue — so it is the one word
// colour that hands `null` upward and lets the trail roll its own blends.
const INK = SURFACE.ink;

const VERBS: readonly Verb[] = [
  // "Designing" opens the loop: the site's own voice, in ink, in the
  // headline's own face. Its letters are already on screen while the sentence
  // fades up, each at its own angle, and they are set straight over the
  // following second — so the first thing the page does is compose itself.
  // A handwritten face (Rock Salt) was tried here and dropped: a second
  // typeface at the head of the one sentence on the page read as a different
  // voice rather than the same one.
  { word: "Designing", color: INK, effect: "typeset" },
  { word: "Prototyping", color: INK_HUES.orange, effect: "anagram" },
  { word: "Pondering", color: INK_HUES.forest, effect: "think" },
  { word: "Imagining", color: INK_HUES.lavender, effect: "wave" },
  { word: "Untangling", color: INK_HUES.pink, effect: "untangle" },
  { word: "Building", color: INK_HUES.blue, effect: "drop" },
  { word: "Shaping", color: INK_HUES.plum, effect: "jelly" },
  { word: "Rewiring", color: INK_HUES.lime, effect: "glitch" },
];
// Every word here has to finish the sentence, and the tail starts with "how" —
// which is a preposition-shaped hole. "Designing how", "Untangling how",
// "Rewiring how" all close; "Tinkering how" and "Breaking how" do not (they
// want "with" and an object), so both were cut rather than swapped for
// something that reads like filler. Any verb added later has to pass the same
// read-the-whole-line test, and has to claim a hue and a motion no other word
// is using.
//
// They also all end in "g", which the slot's right-hand cushion below depends
// on.

/** How long each word holds before the next one takes over. Long enough that
 *  the slowest effect (setting "Designing" straight, at 1s plus its stagger)
 *  finishes with time to be read rather than merely glimpsed. */
const DWELL_MS = 2200;
/** Crossfade duration, shared by every word in both directions. */
const SWAP_MS = 380;
/** Room on the right for the g's overhanging tail. In em so it tracks the
 *  headline's viewport clamp. */
const SWASH_EM = 0.06;
/** How long a letter takes to cross to its own seat in the anagram. */
const ANAGRAM_MS = 560;

/** Deterministic 0..1 from an integer — the scatter has to be identical on the
 *  server and the client or hydration complains, so no Math.random(). */
function noise(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
/** The same, signed. */
function swing(seed: number) {
  return noise(seed) * 2 - 1;
}

/** Per-letter timing. Stagger is per letter index; ltr effects read as a hand
 *  moving through the word, so the order is never centre-out. */
const LETTER_TIMING: Record<string, { ms: number; stagger: number; ease: string }> = {
  // Slowest of the lot, and the gentlest stagger: this one is meant to read as
  // settling, not as arriving.
  typeset: { ms: 1000, stagger: 60, ease: "var(--ease-slow)" },
  untangle: { ms: 760, stagger: 58, ease: "var(--ease-spring)" },
  // The landing is the point, so the curve overshoots hard and comes back:
  // the letter dips past the baseline and recovers, which is a bounce.
  drop: { ms: 560, stagger: 72, ease: "cubic-bezier(0.2, 1.8, 0.4, 1)" },
};

/**
 * Where a letter waits before it is allowed to land. The active word's letters
 * are all at `none`; this is the other end of the transition.
 */
function restingLetter(effect: Effect, i: number): string | undefined {
  switch (effect) {
    // Rotation and nothing else, pivoting on the baseline (see transformOrigin
    // in Letters), so the letters read as tipped where they stand rather than
    // as having been thrown there. Angles stay under 10deg: the word has to be
    // legible the whole way, since it is on screen before the sentence has
    // even finished fading up. This is what keeps it distinct from "untangle"
    // below, which displaces as well as rotates and is twice as steep.
    case "typeset":
      return `rotate(${(swing(i * 4.7) * 8 + Math.sign(swing(i * 4.7)) * 2).toFixed(2)}deg)`;
    // Spun most of the way round, which is what makes it read as a knot
    // pulling loose rather than as letters arriving: 120deg to 180deg, sign
    // alternating so neighbours unwind in opposite directions, plus enough
    // displacement that the word is genuinely tangled before it resolves.
    case "untangle":
      return `translate(${(swing(i * 5.3) * 0.34).toFixed(3)}em, ${(
        swing(i * 2.9) * 0.3
      ).toFixed(3)}em) rotate(${(
        (i % 2 === 0 ? 1 : -1) * (120 + noise(i * 13.1) * 60)
      ).toFixed(1)}deg)`;
    // From above the line, well above it, every letter the same distance so
    // the eye reads a row being built rather than a scatter. The bounce is in
    // the timing function, not here.
    case "drop":
      return "translateY(-0.95em)";
    default:
      return undefined;
  }
}

/**
 * A deterministic derangement of 0..n-1: a shuffle in which no letter is left
 * sitting in its own place, because one letter that never moves is exactly the
 * thing the eye catches. Seeded rather than random so the server and the client
 * scramble the word the same way.
 */
function derange(n: number): number[] {
  const perm = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(noise(i * 31.7 + n) * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  // Any letter the shuffle happened to leave at home trades with its
  // neighbour, so every letter visibly travels.
  for (let i = 0; i < n; i += 1) {
    if (perm[i] === i) {
      const j = i === n - 1 ? i - 1 : i + 1;
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
  }
  return perm;
}

/**
 * The anagram: the word's own letters, dealt into each other's places and then
 * sliding home.
 *
 * This is the one effect that cannot be written in em, because it is the only
 * one whose offsets are a fact about the type rather than a number chosen by
 * eye: letter i has to start exactly where letter perm[i] belongs, which means
 * measuring where the letters actually sit. So each letter's offsetLeft is read
 * off the DOM and the difference becomes its resting translate. Measured on
 * mount, again when the webfont resolves (the fallback's advance widths are not
 * Ovo's), and again on resize, because the headline is a viewport clamp.
 *
 * The travel is horizontal only. Arcing the letters over each other was tried
 * and reads as confetti; keeping them on the line makes it legible as letters
 * swapping seats, which is the whole idea.
 */
function AnagramLetters({ word, landed }: { word: string; landed: boolean }) {
  const letters = [...word];
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [offsets, setOffsets] = useState<number[] | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const xs = refs.current.map((el) => el?.offsetLeft ?? 0);
      const perm = derange(xs.length);
      setOffsets(xs.map((x, i) => xs[perm[i]] - x));
    };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [word]);

  return (
    <>
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="inline-block"
          style={{
            // Before the measurement lands there is nowhere to send the
            // letters, so they simply sit in the right order — a first paint
            // that is merely correct beats one that is scrambled and stuck.
            transform:
              landed || !offsets ? undefined : `translateX(${offsets[i]}px)`,
            transitionProperty: "transform",
            transitionDuration: `${ANAGRAM_MS}ms`,
            // A spring, so each letter arrives with a small overshoot and
            // settles: it reads as being set down rather than snapping to a
            // grid.
            transitionTimingFunction: "var(--ease-spring)",
            transitionDelay: landed ? `${i * 36}ms` : "0ms",
          }}
        >
          {letter}
        </span>
      ))}
    </>
  );
}

/**
 * Which letter leaves the word in "think". The first "o" if there is one (it is
 * the roundest letter in the face, so it reads as a bubble the moment it clears
 * the line), otherwise the middle letter — never the first or last, which would
 * look like the word losing a bookend rather than having a thought.
 */
function floater(word: string) {
  const o = word.toLowerCase().indexOf("o");
  return o > 0 && o < word.length - 1 ? o : Math.floor(word.length / 2);
}

/** The word, split so each letter can be timed on its own. */
function Letters({
  word,
  effect,
  landed,
  pulse,
}: {
  word: string;
  effect: Effect;
  /** False while the letters are still waiting to come in. */
  landed: boolean;
  /** Flip counter. Keyframe effects are restarted by keying on it — an element
   *  that is never unmounted would otherwise play its animation once, on the
   *  first pass, and sit still for every loop after that. */
  pulse: number;
}) {
  const timing = LETTER_TIMING[effect];
  const letters = [...word];
  const lifts = effect === "think" ? floater(word) : -1;

  return (
    <>
      {letters.map((letter, i) => {
        // The keyframe effects carry no inline transform at all: the animation
        // owns it, and a transform here would be overwritten the moment it
        // started.
        const keyframed =
          effect === "wave" || effect === "think" || effect === "glitch";

        const style: CSSProperties = keyframed
          ? {
              // The only per-letter value a wave needs: the delay that turns
              // separate bounces into one crest travelling through the word.
              animationDelay:
                effect === "wave"
                  ? `${i * 90}ms`
                  : effect === "glitch"
                    ? `${i * 26}ms`
                    : undefined,
              transformOrigin: effect === "wave" ? "50% 100%" : undefined,
            }
          : {
              transform: landed ? undefined : restingLetter(effect, i),
              // Tipped letters pivot on the line they sit on. Everything
              // else rotates about its own middle.
              transformOrigin: effect === "typeset" ? "50% 88%" : undefined,
              transitionProperty: "transform",
              transitionDuration: `${timing?.ms ?? SWAP_MS}ms`,
              transitionTimingFunction: timing?.ease ?? "var(--ease-slow)",
              // Leaving is uniform: no delay on the way out, so the whole
              // word goes at once and only arrivals are choreographed.
              transitionDelay: landed ? `${i * (timing?.stagger ?? 0)}ms` : "0ms",
            };

        // Only the live word animates. The glitch also has to start over on
        // every flip, so its letters are keyed on the counter and remount.
        const animClass =
          effect === "wave"
            ? "verb-wave"
            : effect === "think" && i === lifts
              ? "verb-think"
              : effect === "glitch" && landed
                ? "verb-glitch"
                : "";

        return (
          <span
            key={effect === "glitch" ? `${letter}-${i}-${pulse}` : `${letter}-${i}`}
            className={`inline-block ${animClass}`}
            style={style}
          >
            {letter}
          </span>
        );
      })}
    </>
  );
}

export default function RotatingWord({
  startDelayMs = 0,
  armDelayMs = 0,
  onTint,
}: {
  /** Hold the opening word this much longer, so the line's entrance lands
   *  before anything starts turning over. */
  startDelayMs?: number;
  /** When the opening word is allowed to play its effect. The headline fades
   *  up first with "Designing" already in place but askew, and this is when
   *  its letters start straightening — so the sentence sets itself once it has
   *  finished arriving, instead of doing both at once. */
  armDelayMs?: number;
  /** Fires with the live word's hue, or null for ink. The hero feeds it to the
   *  footprint canvas so the trail wears the same colour. */
  onTint?: (hue: string | null) => void;
}) {
  const [index, setIndex] = useState(0);
  // Mirrors the OS setting so the doodles can render fully drawn instead of
  // stroking themselves on, and so no word plays an effect. Read in an effect,
  // not at render, so SSR and the first client paint agree.
  const [calm, setCalm] = useState(false);
  const [armed, setArmed] = useState(false);
  const [slot, setSlot] = useState<number | null>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);

  // Pin the slot to the widest word. Measured rather than hard-coded because
  // the font-size is a viewport clamp and the faces are webfonts — the fallback
  // metrics are not the real ones, so this re-runs once the fonts resolve and
  // again on resize. Letters are measured at rest, which is safe precisely
  // because no effect touches layout.
  useLayoutEffect(() => {
    const measure = () =>
      setSlot(
        Math.max(
          ...spans.current.map((el) => el?.getBoundingClientRect().width ?? 0),
        ),
      );

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    // Anyone who has asked the OS for less motion gets the resting word and no
    // timer at all.
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (quiet.matches) {
      setCalm(true);
      return;
    }

    let id = 0;
    const arm = window.setTimeout(() => setArmed(true), armDelayMs);
    const start = window.setTimeout(() => {
      id = window.setInterval(
        () => setIndex((i) => (i + 1) % VERBS.length),
        DWELL_MS,
      );
    }, startDelayMs);

    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [startDelayMs, armDelayMs]);

  // Publish the live hue upward. Ink is the page's own text colour rather than
  // a palette hue, so it reports null and the trail goes back to rolling its
  // own blends — the coupling shows itself on the seven coloured words and
  // relaxes on the resting one.
  useEffect(() => {
    const hue = VERBS[index].color;
    onTint?.(hue === INK ? null : hue);
  }, [index, onTint]);

  return (
    // Inline-grid so the verb sits on the line with the tail. Before the first
    // measurement the width is `auto`, which the grid already sizes to the
    // longest word — the same value the measurement will land on, so there is
    // no reflow when it arrives.
    <span
      // items-baseline plus the anchor below is what keeps the verb sitting on
      // the sentence's line. An inline-grid takes its own baseline from its
      // first grid item, so the whole slot used to hang off whatever
      // "Designing" happened to be — which broke outright while that word was
      // set in another face at another size. items-baseline makes all nine
      // items (the anchor and the eight words) share one baseline, and the
      // anchor sources it from the headline's own type, so no word can drag
      // the line again.
      className="inline-grid items-baseline justify-items-center align-baseline"
      style={{
        // The cushion is not slop: every verb here ends in "g", and Ovo's g
        // finishes with a tail that overhangs its own advance width (the
        // script face's is longer still). A slot measured to the advance is
        // therefore a few px short of the ink, and the tail lands on the "h"
        // of "how". The padding puts the cushion entirely on the right
        // (border-box, so the content box is still exactly the measured
        // width) — the word stays centred on its own metrics and the descender
        // gets somewhere to go.
        width: slot ? `calc(${slot}px + ${SWASH_EM}em)` : undefined,
        paddingRight: `${SWASH_EM}em`,
      }}
      aria-hidden="true"
    >
      {/* The baseline anchor: a zero-width space in the sentence's own font and
          size, in the same cell as the words. It draws nothing and takes no
          width, and it gives the grid a baseline that no word can drag around
          . */}
      <span className="[grid-area:1/1]">{"\u200b"}</span>
      {VERBS.map((verb, i) => {
        const active = i === index;
        // Calm skips the arming gate entirely: there is no effect to wait for,
        // so the opening word is simply present.
        const landed = calm || (active && armed);

        return (
          <span
            key={verb.word}
            ref={(el) => {
              spans.current[i] = el;
            }}
            className={`relative [grid-area:1/1] whitespace-nowrap transition-[opacity,transform,color] ease-slow ${
              active ? "opacity-100" : "opacity-0"
            } ${verb.effect === "drift" && !calm ? "verb-drift" : ""}`}
            style={{
              color: verb.color,
              transitionDuration: `${SWAP_MS}ms`,
              // Resting words sit a hair low; the active one rises to the
              // baseline. So the incoming word lifts in as the outgoing one
              // settles back down, both on the same curve. The drift keyframe
              // owns the transform on its own word, so that one is left alone.
              transform:
                verb.effect === "drift"
                  ? undefined
                  : active
                    ? "translateY(0)"
                    : "translateY(0.14em)",
            }}
          >
            <span
              // The text layer. The squash lives here rather than on the
              // parent so the doodle beside it is untouched.
              className="inline-block"
              style={{
                ...(verb.effect === "squash"
                  ? {
                      transformOrigin: "50% 100%",
                      transform: landed ? "scale(1, 1)" : "scale(0.72, 1.16)",
                      transition: calm
                        ? "none"
                        : "transform 560ms var(--ease-spring)",
                    }
                  : {}),
              }}
            >
              {verb.effect === "drift" || verb.effect === "squash" ? (
                verb.word
              ) : verb.effect === "anagram" ? (
                <AnagramLetters word={verb.word} landed={landed} />
              ) : (
                <Letters word={verb.word} effect={verb.effect} landed={landed} />
              )}
            </span>
            <VerbDoodle
              word={verb.word}
              color={verb.color}
              active={landed}
              calm={calm}
            />
          </span>
        );
      })}
    </span>
  );
}
