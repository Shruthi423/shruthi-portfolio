"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import DesigningHand from "@/app/components/home/DesigningHand";
import VerbDoodle from "@/app/components/home/VerbDoodles";
import { INK_HUES } from "@/app/lib/footprints";

/**
 * The verb at the head of the hero, which will not sit still.
 *
 * The sentence is "<verb> how humans meet AI." on one line — the tail is
 * fixed, the verb cycles. Eight words, and each one owns two things nothing
 * else in the list has: a hue, and a motion. The motion is chosen to mean the
 * word (the letters of "Prototyping" are dealt scrambled and trade places
 * until they spell it, a knot resolves for "Untangling", the letters of
 * "Shaping" roll in from the left and assemble) rather than to decorate it, which is the whole reason there
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
 *  - Reduced motion gets the resting word, fully written, with no timer and no
 *    effect at all. A headline that rewrites itself every couple of seconds is
 *    exactly what that setting is for.
 *  - Seven faces for eight words, all of them loaded in app/layout.tsx.
 *    Each word is set in whichever of them its motion is about (mono for the
 *    letters that trade seats, a joined-up hand for the knot, the heaviest
 *    weight available for the word that stacks) and scaled back to Ovo's cap
 *    height, because a face is only worth swapping in if it makes the motion
 *    legible. Two words stay in Ovo so the line still has a voice of its own.
 *    No word is left in the headline's own Ovo: the two that were read as the
 *    words nothing had been done to. See the Face type below for what a face
 *    may override and why.
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
 *  handwrite — the word is set in Homemade Apple and written by a pen that
 *             follows the path of each letter, in the order a hand makes them
 *  anagram  — the letters are dealt in the wrong order, then trade places
 *             until the word is spelled right
 *  think    — the word drifts, and one letter floats off above the line, hangs
 *             there like a thought, and drops back into its slot
 *  wave     — letters bounce up in a travelling crest, squashing as they land
 *  untangle — letters arrive spun most of the way round, unwinding from one end
 *  pile     — letters fall from above onto one spot, heaping up, then shuffle
 *             sideways out of the pile into the word
 *  roll     — the letters roll in from one point off to the left and assemble,
 *             each spinning by exactly as much ground as it covers
 *  rewire   — letters jump in hard frames, and then the dots over the two i's
 *             trade places
 *
 * The amplitudes are deliberately large. An earlier pass kept every effect
 * under about 0.2em and it read as interface polish rather than as character —
 * the same gesture eight times over, at a size nobody remembers. These travel
 * three to four times as far, overshoot rather than ease, and each one commits
 * to a single property instead of nudging three.
 */
type Effect =
  | "handwrite"
  | "anagram"
  | "think"
  | "wave"
  | "untangle"
  | "pile"
  | "roll"
  | "rewire";

/**
 * The face a word is set in, and the three corrections that let a face other
 * than Ovo share a line with it.
 *
 * None of these numbers were chosen by eye. The faces were opened with
 * fontTools and measured, because the two things that go wrong when you mix
 * faces in one slot are both arithmetic:
 *
 * `em` — seven faces at one font-size do not look like one size. Grandstander's
 * x-height is 0.579 of its em and Gochi Hand's cap height is 0.56 of its own,
 * so set at 1em the rounded face reads as shouting and Gochi as a footnote. Each value
 * is a 60/40 blend of matching Ovo's x-height (0.460em) and its cap height
 * (0.662em): these words are nearly all lowercase, so the x-height is what the
 * eye sizes them by, but weighting it alone makes the capital tower.
 *
 * `trackingEm` — the slot is pinned to the widest word, so every other word
 * sits in the middle of it with air on both sides, and that air is the gap
 * between the verb and "how". DM Mono is a wide face: "Prototyping" in it runs
 * 6.07em at its matched size against Ovo's 5.07em, which would have grown the
 * slot by a fifth and pushed "meet AI." off a phone (at 390px the line has
 * only 0.39em of slack, which is the constraint this whole table is solved
 * against). So the mono word is tracked in and the short words tracked out,
 * until the spread between the widest and narrowest word is 1.16em rather than
 * the 1.52em the sentence shipped with when every word was Ovo. The gap is
 * smaller than it used to be, not merely no worse.
 *
 * Tracking also adds a space after the final letter, which is dead width on
 * the right and shifts the ink off centre, so the render cancels exactly one
 * tracking unit with a negative margin.
 *
 * Scaling the word rather than the slot is safe because the slot is measured
 * from the rendered spans (see the measure effect below) and re-measured once
 * the webfonts resolve, so whichever word ends up widest is the one the
 * sentence is sized against. "Prototyping" is still that word, by 0.13em.
 */
type Face = {
  /** Tailwind font utility. Absent means the headline's own Ovo. */
  className?: string;
  /** Size relative to the sentence: a measured 60/40 blend of Ovo's x-height
   *  and cap height. Absent means 1. */
  em?: number;
  /** Tracking, in em of the word's own size. Negative pulls a wide face back
   *  inside the slot; positive fills a narrow one out toward its edges. */
  trackingEm?: number;
  /** Where the drawn tittle sits, for the one word that draws its own — a
   *  fact about the face's own metrics, so it cannot live in a constant. */
  dotDropEm?: number;
  /** How big that tittle is, in em of the word. Absent means DOT_EM. */
  dotEm?: number;
  /** Square it off. True for a face drawn on a pixel grid, where a round dot is
   *  the one thing in the word that is not made of pixels. */
  dotSquare?: boolean;
};

type Verb = {
  word: string;
  /** Palette hue, from INK_HUES — the readable-at-display-size tier. */
  color: string;
  effect: Effect;
  /** Every word carries one; only the written word leaves it empty, because
   *  its SVG sets its own face and scale. */
  face: Face;
};

const VERBS: readonly Verb[] = [
  // "Designing" opens the loop: the site's own voice. It is written rather than
  // typed — Homemade Apple, revealed by a pen that travels the letters in the
  // order a hand makes them — so the first thing the page does is put the word
  // down by hand. It was once the only word here not set in Ovo; now that the
  // whole list carries its own face, what still makes this one the opener is
  // the writing, not the typeface. (Which is also why an early pass at simply
  // swapping in Rock Salt was dropped: a face alone read as a different voice.)
  // It held the page's ink for a while, on the theory that the opening word
  // should be the site's resting colour, then the footer's teal. Both read as
  // the one word that had forgotten to join in: at #123b36 the teal is a
  // decimal point away from ink, so the word the page opens on was the
  // quietest of the eight. It takes the site accent instead, which is the
  // loudest hue in the palette and the one the rest of the site is already
  // keyed to. Orange and forest shift down a place to make room, and every
  // verb still wears a hue no other verb does.
  // Its face is empty here on purpose: DesigningHand is an SVG that sets its
  // own Homemade Apple and its own scale, so an `em` here would compound with
  // that one and shrink the word twice.
  { word: "Designing", color: INK_HUES.orange, effect: "handwrite", face: {} },
  // Mono, because the anagram's letters trade places and a face whose every
  // letter occupies the same width makes that read as a mechanism rather than
  // as a wobble — the seats are visibly identical, so the swap is the only
  // thing moving. It is also the widest word in the list and therefore the one
  // that sets the slot, which is why it is the only word tracked inward.
  {
    word: "Prototyping",
    color: INK_HUES.forest,
    effect: "anagram",
    face: { className: "font-mono", em: 0.86, trackingEm: -0.045 },
  },
  // The loosest of the three hands, for the word that is not concentrating.
  {
    word: "Pondering",
    color: INK_HUES.teal,
    effect: "think",
    face: { className: "font-schoolbell", em: 0.96, trackingEm: 0.1 },
  },
  // Gochi already sits on an uneven baseline, so the wave amplifies what the
  // face is doing instead of fighting it.
  {
    word: "Imagining",
    color: INK_HUES.lavender,
    effect: "wave",
    face: { className: "font-gochi", em: 1.23, trackingEm: 0.02 },
  },
  // Homemade Apple again, and the one place in the list where a repeated face
  // earns itself: it is the only looped, joined-up hand loaded, so the knot
  // pulling loose happens on letters that already look like thread. It reads
  // as a different thing from "Designing" because that word is drawn by a pen
  // and this one is simply set.
  {
    word: "Untangling",
    color: INK_HUES.pink,
    effect: "untangle",
    face: { className: "font-apple", em: 0.88 },
  },
  // Bricolage Grotesque at bold: a grotesque with deliberately irregular
  // widths, so a word built out of it is visibly built out of parts of
  // different sizes — which is what makes the pile read as masonry rather than
  // as eight identical bricks. Figtree had the weight for it and none of the
  // character at any weight. Set a little above its matched size, because it
  // is one of the two narrowest words and the size is doing work the tracking
  // would otherwise have to do alone.
  {
    word: "Building",
    color: INK_HUES.blue,
    effect: "pile",
    face: {
      className: "font-bricolage font-bold",
      em: 0.94,
      trackingEm: 0.13,
    },
  },
  // Grandstander, rounded and a little goofy in its proportions, for the word
  // whose letters roll: the bowls are circles, so the face and the motion are
  // saying the same thing. Two faces came before it here and both were chosen
  // for a motion this word no longer has — Jost for its real italic (the word
  // used to come upright out of true italic letterforms rather than out of a
  // skew), then the site's own Figtree when the roll replaced it, which was
  // correct and had no character at all. A roll happens to a letter's position
  // and not to its shape, so the thing to spend on here is roundness.
  // Set at medium: Grandstander's widths barely move across its weight axis
  // (3.978em at 500 against 3.975em at 400), so the weight is free and the word
  // can carry some presence at 84px without the slot shifting.
  {
    word: "Shaping",
    color: INK_HUES.plum,
    effect: "roll",
    face: {
      className: "font-grandstander font-medium",
      // x-height 0.579 of its em against Ovo's 0.457, cap height 0.653 against
      // Ovo's 0.662 — so the usual 60/40 blend lands at 0.88. It is the
      // largest x-height in the table, which is why this is also the smallest
      // em in it.
      em: 0.88,
      // Untracked, this word sets at 3.50em of the sentence, almost exactly
      // what Ovo gives it (3.54em) and a third of an em narrower than the
      // face it replaced. The track puts that width back: short words are
      // tracked out here so the spread between the widest word and the
      // narrowest stays small, because that spread is the gap between the verb
      // and "how".
      trackingEm: 0.09,
    },
  },
  // Pixelify Sans: letters drawn on a visible pixel grid, and the only face in
  // the table actually built out of parts — which is the point, because this
  // word's effect is two of its parts trading places. It was DM Mono at medium
  // for a while, on the theory that the two technical words should share a
  // voice; what that actually bought was the list's one repeated face doing
  // its second-best job, and a swap of two dots that read as a wobble because
  // nothing else in the word looked removable. On a grid, a tittle is visibly
  // a component.
  //
  // Everything about its tittles comes off the face's own grid rather than out
  // of the constants: Pixelify's period is exactly one pixel, 0.110em wide and
  // 0.113em tall, so that is the size, and it is square because every other
  // mark in the word is.
  {
    word: "Rewiring",
    color: INK_HUES.lime,
    effect: "rewire",
    face: {
      className: "font-pixelify font-medium",
      // x-height 0.456 of its em against Ovo's 0.457 and cap height 0.633
      // against Ovo's 0.662: the one face here that is already almost the
      // right size, so the blend barely moves it.
      em: 1.02,
      // Still the second-widest word in the list and still carrying the track
      // that reads as a circuit trace.
      trackingEm: 0.1,
      // The i's own dot sits one pixel clear of the x-height, from 0.520em to
      // 0.633em above the baseline. The drawn one is pulled down to meet it:
      // the letter's box top sits at half-leading plus ascent above the
      // baseline ((1.12 - 1.20) / 2 + 0.92 = 0.88em), and 0.88 - 0.52 is the
      // drop. Of every number in this table this is the one most worth
      // checking on screen, because it is the only one that depends on the
      // inline box rather than on the glyphs.
      dotDropEm: 0.36,
      dotEm: 0.11,
      dotSquare: true,
    },
  },
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
 *  the slowest effect (the hand writing "Designing", at 1.5s) finishes with
 *  time to be read rather than merely glimpsed. */
const DWELL_MS = 2200;
/** Crossfade duration, shared by every word in both directions. */
const SWAP_MS = 380;
/** Room on the right for the g's overhanging tail. In em so it tracks the
 *  headline's viewport clamp. */
const SWASH_EM = 0.06;
/** How long a letter takes to cross to its own seat in the anagram. */
const ANAGRAM_MS = 560;
/** The pile: how long one letter takes to fall, how far apart the falls are,
 *  and how long the sideways spread out of the heap takes afterwards. */
const FALL_MS = 340;
const FALL_STAGGER_MS = 70;
const SPREAD_MS = 520;
/** The dotless i the two rewired letters are set in, and the defaults for the
 *  tittle drawn over it: its diameter, and how far it is pulled back down from
 *  the top of the letter's box. Both in em so they track the headline's clamp.
 *  These are the Ovo-shaped defaults and nothing uses them as they stand — the
 *  one word that draws its own tittles is set on a pixel grid and brings its own
 *  size, drop and shape (see Face.dotEm / dotSquare). They are the fallback for
 *  a future word whose face does not care. */
const DOTLESS_I = "\u0131";
const DOT_EM = 0.085;
const DOT_DROP_EM = 0.3;

/** The roll: how long one letter takes at the longest travel in the word, how
 *  far apart they set off, and how much clear air to the left they set off from
 *  (in em of the word's own size, so it tracks the headline's clamp).
 *
 *  ROLL_R_EM is the rolling radius, and it is the one number here doing real
 *  work: a letter's spin is its travel divided by this circumference, never a
 *  rotation picked per letter. Smaller than the ink looks, on purpose — a radius
 *  matched to a letter's actual size gives about a third of a turn over a short
 *  hop, which reads as a wobble rather than as a roll. */
const ROLL_MS = 720;
const ROLL_STAGGER_MS = 46;
const ROLL_IN_EM = 1.15;
const ROLL_R_EM = 0.3;

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
  untangle: { ms: 760, stagger: 58, ease: "var(--ease-spring)" },
};

/**
 * Where a letter waits before it is allowed to land. The active word's letters
 * are all at `none`; this is the other end of the transition.
 */
function restingLetter(effect: Effect, i: number): string | undefined {
  switch (effect) {
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
    default:
      return undefined;
  }
}

/**
 * Every letter's horizontal centre, in px, relative to the word — and the font
 * size those px were measured at, which only the roll needs (its spin is a
 * travel over a circumference in em, so it cannot be worked out from the
 * centres alone).
 *
 * Four effects need to know where the letters actually are rather than
 * choosing an offset by eye: the anagram (letter i starts where letter perm[i]
 * belongs), the pile (every letter starts heaped on one spot), the roll (every
 * letter sets off from one point to the left, so its travel and therefore its
 * spin is a fact about where it sits) and the dot swap
 * (each tittle has to travel exactly as far as the next i). Measured on mount,
 * again once the webfont resolves — the fallback's advance widths are not
 * Ovo's — and again on resize, because the headline is a viewport clamp.
 *
 * Letters are measured while their word is sitting at opacity 0, which is fine:
 * it is transparent, not display:none, so the metrics are real.
 */
function useLetterCentres(word: string) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [centres, setCentres] = useState<number[] | null>(null);
  const [fontPx, setFontPx] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      setCentres(
        refs.current.map((el) =>
          el ? el.offsetLeft + el.offsetWidth / 2 : 0,
        ),
      );
      const first = refs.current[0];
      if (first) {
        setFontPx(parseFloat(window.getComputedStyle(first).fontSize) || 0);
      }
    };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [word]);

  return { refs, centres, fontPx };
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
  const { refs, centres } = useLetterCentres(word);
  const offsets = centres
    ? (() => {
        const perm = derange(centres.length);
        return centres.map((x, i) => centres[perm[i]] - x);
      })()
    : null;

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
 * Building: letters fall from above onto a single spot, heap up there, and then
 * shuffle sideways out of the pile into the word.
 *
 * Two movements that must not blur into each other, which is why each letter is
 * two nested spans: the inner one owns the fall (Y), the outer one owns the
 * spread (X). One transform cannot do it — the fall has to finish before the
 * spread begins, and a single transform interpolates both at once, which looks
 * like letters drifting in diagonally. Nested, the timings are independent: the
 * inner spans drop one after another, and every outer span waits until the last
 * letter has landed before anything slides.
 *
 * The pile sits at the word's own centre, so the heap is under the middle of
 * the slot and the letters spread outward in both directions from it.
 */
function PileLetters({ word, landed }: { word: string; landed: boolean }) {
  const letters = [...word];
  const { refs, centres } = useLetterCentres(word);
  const pile = centres ? (centres[0] + centres[centres.length - 1]) / 2 : 0;
  // Every letter has fallen by the time the last one lands; the spread starts
  // there.
  const fallTotal = FALL_MS + (letters.length - 1) * FALL_STAGGER_MS;

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
            // The spread. Until the letters have been measured there is no
            // pile to spread out of, so the word simply sits correct.
            transform:
              landed || !centres
                ? undefined
                : `translateX(${pile - centres[i]}px)`,
            transitionProperty: "transform",
            transitionDuration: `${SPREAD_MS}ms`,
            transitionTimingFunction: "var(--ease-spring)",
            transitionDelay: landed ? `${fallTotal + i * 34}ms` : "0ms",
          }}
        >
          <span
            className="inline-block"
            style={{
              // The fall. Well above the line, so it reads as dropping in from
              // outside the sentence rather than rising into it.
              transform: landed ? undefined : "translateY(-1.15em)",
              transitionProperty: "transform",
              transitionDuration: `${FALL_MS}ms`,
              // Overshoots past the baseline and recovers: the letter lands on
              // the heap rather than arriving at it.
              transitionTimingFunction: "cubic-bezier(0.3, 1.7, 0.45, 1)",
              transitionDelay: landed ? `${i * FALL_STAGGER_MS}ms` : "0ms",
            }}
          >
            {letter}
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Rewiring: the letters flicker in, and then the dots over the two i's trade
 * places.
 *
 * The swap is the word's own joke, and it is the reason those two letters are
 * set as dotless i's (U+0131, in Google's standard latin subset) with a tittle
 * of our own drawn above each. A real i's dot is part of its glyph and cannot
 * be moved; a drawn one can. Everything else about the letters is untouched.
 *
 * Each dot travels the measured gap to the other i, so the landing is exact at
 * any viewport size, and the two take different arcs — one over the top, one
 * skimming the letters — so they cross instead of colliding. They keep their
 * new places for as long as the word holds, and the next time round they start
 * over from home, which is why the whole thing is keyed on the flip counter.
 */
function RewireWord({
  word,
  landed,
  pulse,
  dotDrop = DOT_DROP_EM,
  dotSize = DOT_EM,
  square = false,
}: {
  word: string;
  landed: boolean;
  pulse: number;
  /** From the word's own face: a tittle's height above the letter is a fact
   *  about that face's metrics, and this word is not set in Ovo. */
  dotDrop?: number;
  /** Likewise its size — on a pixel face, one of the face's own pixels. */
  dotSize?: number;
  /** Square rather than round, for a face drawn on a grid. */
  square?: boolean;
}) {
  const letters = [...word];
  const { refs, centres } = useLetterCentres(word);
  const dotted = letters.flatMap((c, i) => (c.toLowerCase() === "i" ? [i] : []));

  return (
    <>
      {letters.map((letter, i) => {
        const dot = dotted.indexOf(i);
        // Which way this dot travels, and how far: to the other i's centre.
        const partner = dot === 0 ? dotted[1] : dotted[0];
        const swap =
          dot >= 0 && centres && partner !== undefined
            ? centres[partner] - centres[i]
            : 0;

        return (
          <span
            key={`${letter}-${i}-${pulse}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`relative inline-block ${landed ? "verb-glitch" : ""}`}
            style={{ animationDelay: `${i * 26}ms` }}
          >
            {dot >= 0 ? DOTLESS_I : letter}
            {dot >= 0 && (
              <span
                aria-hidden="true"
                // Anchored above the letter's own box and pulled back down —
                // the same trick VerbDoodles uses for its shoulder marks, and
                // the one number here that is set by eye rather than measured.
                className={`absolute bg-current ${square ? "" : "rounded-full"} ${
                  landed
                    ? dot === 0
                      ? "verb-swap-over"
                      : "verb-swap-under"
                    : ""
                }`}
                style={
                  {
                    left: "50%",
                    bottom: "100%",
                    marginLeft: `-${dotSize / 2}em`,
                    marginBottom: `-${dotDrop}em`,
                    width: `${dotSize}em`,
                    height: `${dotSize}em`,
                    "--swap": `${swap}px`,
                  } as CSSProperties
                }
              />
            )}
          </span>
        );
      })}
    </>
  );
}

/**
 * Shaping: the letters roll in from the left and assemble into the word.
 *
 * Every letter sets off from the same point, a little over an em clear of the
 * word's own first letter, and they leave in reading order, so the word gathers
 * itself left to right rather than sliding in as a block. Two things are what
 * make it read as rolling rather than as sliding, and neither is a number
 * chosen by eye:
 *
 *  - The spin is the travel divided by the circumference in ROLL_R_EM. So the
 *    last letter, which crosses the whole word, turns several times more than
 *    the first, which crosses almost nothing — exactly as two wheels of one size
 *    would. Give every letter the same rotation instead and the word reads as
 *    letters twirling on the spot while they drift sideways.
 *  - The far letters take longer. Duration scales with distance (down to 62% of
 *    ROLL_MS at the near end), so the whole word is rolling at something close
 *    to one speed. A shared duration makes the last letter by far the fastest
 *    thing on the line, which looks thrown rather than rolled.
 *
 * Deceleration with no overshoot, which is the one place this parts company with
 * the rest of the file: every other arrival here lands on --ease-spring and
 * settles. A letter that rolls past its seat and comes back has bounced off
 * something, and there is nothing there to bounce off.
 *
 * The resting state carries the transform and landing clears it, so the word
 * waits at the queue point while its span is still faded out and starts rolling
 * as it fades up. Nothing has to be timed against the crossfade for that: the
 * letters are already where they set off from long before the word is on the
 * line.
 */
function RollLetters({ word, landed }: { word: string; landed: boolean }) {
  const letters = [...word];
  const { refs, centres, fontPx } = useLetterCentres(word);

  // Where the roll starts, and the longest travel in the word — the distance
  // every duration is scaled against.
  const start = centres ? centres[0] - ROLL_IN_EM * fontPx : 0;
  const longest = centres ? centres[centres.length - 1] - start : 0;
  // One turn of the wheel, in the px the centres are measured in.
  const circumference = 2 * Math.PI * ROLL_R_EM * fontPx;

  return (
    <>
      {letters.map((letter, i) => {
        const travel = centres ? centres[i] - start : 0;
        const spin = circumference > 0 ? (travel / circumference) * 360 : 0;
        const share = longest > 0 ? travel / longest : 1;

        return (
          <span
            key={`${letter}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="inline-block"
            style={{
              // Before the measurement lands there is nowhere to send the
              // letters, so they simply sit in the right place — a first paint
              // that is merely correct beats one stuck out in the margin.
              transform:
                landed || !centres
                  ? undefined
                  : `translateX(${(-travel).toFixed(1)}px) rotate(${(-spin).toFixed(1)}deg)`,
              transitionProperty: "transform",
              transitionDuration: `${Math.round(ROLL_MS * (0.62 + 0.38 * share))}ms`,
              transitionTimingFunction: "var(--ease-slow)",
              // Leaving is uniform: no delay on the way out, so the whole word
              // goes at once and only arrivals are choreographed.
              transitionDelay: landed ? `${i * ROLL_STAGGER_MS}ms` : "0ms",
            }}
          >
            {letter}
          </span>
        );
      })}
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
}: {
  word: string;
  effect: Effect;
  /** False while the letters are still waiting to come in. */
  landed: boolean;
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
        const keyframed = effect === "wave" || effect === "think";

        const style: CSSProperties = keyframed
          ? {
              // The only per-letter value a wave needs: the delay that turns
              // separate bounces into one crest travelling through the word.
              animationDelay: effect === "wave" ? `${i * 90}ms` : undefined,
              transformOrigin: effect === "wave" ? "50% 100%" : undefined,
            }
          : {
              transform: landed ? undefined : restingLetter(effect, i),
              transitionProperty: "transform",
              transitionDuration: `${timing?.ms ?? SWAP_MS}ms`,
              transitionTimingFunction: timing?.ease ?? "var(--ease-slow)",
              // Leaving is uniform: no delay on the way out, so the whole
              // word goes at once and only arrivals are choreographed.
              transitionDelay: landed ? `${i * (timing?.stagger ?? 0)}ms` : "0ms",
            };

        const animClass =
          effect === "wave"
            ? "verb-wave"
            : effect === "think" && i === lifts
              ? "verb-think"
              : "";

        return (
          <span
            key={`${letter}-${i}`}
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
   *  up first with the verb's slot empty, and this is when the hand starts
   *  writing — so the sentence arrives first and is then signed, instead of
   *  doing both at once. */
  armDelayMs?: number;
  /** Fires with the live word's hue, or null for ink. The hero feeds it to the
   *  footprint canvas so the trail wears the same colour. */
  onTint?: (hue: string | null) => void;
}) {
  const [index, setIndex] = useState(0);
  // Counts flips rather than tracking the index, because the index repeats
  // every loop and the keyframe effects need something that never does: it is
  // what their elements are keyed on, and a key that repeated would leave the
  // glitch and the knead playing once and then sitting still forever.
  const [pulse, setPulse] = useState(0);
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
      id = window.setInterval(() => {
        setIndex((i) => (i + 1) % VERBS.length);
        setPulse((p) => p + 1);
      }, DWELL_MS);
    }, startDelayMs);

    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [startDelayMs, armDelayMs]);

  // Publish the live hue upward, so the footprint trail is tinted by whichever
  // word is on the line. Every one of the eight carries a hue now, so this
  // never reports null; the consumer still takes it, for a caller that wants
  // the trail rolling its own blends again.
  useEffect(() => {
    onTint?.(VERBS[index].color);
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
        // finishes with a tail that overhangs its own advance width. A slot
        // measured to the advance is
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
          width, and it gives the grid a baseline that no word can drag
          around. */}
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
              verb.face.className ?? ""
            } ${active ? "opacity-100" : "opacity-0"} ${
              verb.effect === "think" && !calm ? "verb-drift" : ""
            }`}
            style={{
              color: verb.color,
              // The face's own size and tracking. Set here rather than on the
              // text layer inside so that everything measured in em — the
              // effects' offsets, the doodle beside the word — scales with the
              // word it belongs to instead of with the sentence.
              fontSize: verb.face.em ? `${verb.face.em}em` : undefined,
              letterSpacing: verb.face.trackingEm
                ? `${verb.face.trackingEm}em`
                : undefined,
              // Tracking is applied after every letter including the last, so
              // it leaves that much dead width on the right and shifts the ink
              // off the centre of the slot. Cancel exactly one unit of it.
              marginRight: verb.face.trackingEm
                ? `${-verb.face.trackingEm}em`
                : undefined,
              transitionDuration: `${SWAP_MS}ms`,
              // Resting words sit a hair low; the active one rises to the
              // baseline. So the incoming word lifts in as the outgoing one
              // settles back down, both on the same curve. "Pondering" is the
              // exception: its drift keyframe owns the transform on that word,
              // so this leaves it alone.
              transform:
                verb.effect === "think"
                  ? undefined
                  : active
                    ? "translateY(0)"
                    : "translateY(0.14em)",
            }}
          >
            {/* The text layer. Every effect but the written word is a
                per-letter component, so the wrapper that used to sit here to
                take the trampoline as one piece went with it. */}
            <span className="inline-block">
              {verb.effect === "handwrite" ? (
                <DesigningHand landed={landed} calm={calm} pulse={pulse} />
              ) : verb.effect === "anagram" ? (
                <AnagramLetters word={verb.word} landed={landed} />
              ) : verb.effect === "pile" ? (
                <PileLetters word={verb.word} landed={landed} />
              ) : verb.effect === "roll" ? (
                <RollLetters word={verb.word} landed={landed} />
              ) : verb.effect === "rewire" ? (
                <RewireWord
                  word={verb.word}
                  landed={landed}
                  pulse={pulse}
                  dotDrop={verb.face.dotDropEm}
                  dotSize={verb.face.dotEm}
                  square={verb.face.dotSquare}
                />
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
