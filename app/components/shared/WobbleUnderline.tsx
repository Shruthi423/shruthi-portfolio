/**
 * The hand-drawn hover underline, shared by the nav and the footer links.
 *
 * It replaces a 1px `::after` that scaled in from the left. That sweep was
 * fine, but it read as CSS: a perfectly straight hairline growing at a
 * perfectly even rate. This draws a stroke instead, with the same left-to-right
 * direction and roughly the same duration, so the interaction is unchanged and
 * only the handwriting is new. Same trick as VerbDoodles, minus the per-word
 * choreography.
 *
 * Three things this file exists to get right:
 *
 *  - The squiggle is deterministic. Its shape is hashed out of the label, not
 *    Math.random, so the server and the client draw the same path and the
 *    stroke does not reshuffle on every re-render.
 *  - The wavelength holds. The viewBox grows with the character count, so the
 *    bumps under "PLAYGROUND" are the same size as the ones under "WORK"
 *    instead of being stretched two and a half times as wide.
 *  - The stroke does not distort. `preserveAspectRatio="none"` lets the path
 *    fill whatever width the label happens to be, and `non-scaling-stroke`
 *    stops that stretch from thinning the ink — which is the reason this can
 *    stretch where a VerbDoodle could not.
 */

/** viewBox units per character. Sets the wobble's wavelength, not its size. */
const UNITS_PER_CHAR = 9;
/** One bump per this many characters. Fewer, longer bumps read as a pen. */
const CHARS_PER_BUMP = 2;
const VB_HEIGHT = 10;
/** Set so the stroke lands ~2px under 13px type, where the old hairline sat. */
const BASELINE = 3.2;
/** How far the line wanders off the baseline, in viewBox units. Tuned against
 *  the 13px mono labels: much less than this and the stretch flattens it back
 *  into the straight line we just removed. */
const WANDER = 2.6;
/** A real pen starts before the word and lifts after it, as a share of one bump. */
const OVERSHOOT = 0.14;

/**
 * FNV-1a over the label, salted with the point index, folded to [0, 1).
 * Deterministic on both sides of hydration, which `Math.random` would not be.
 */
function rand(seed: string, i: number): number {
  let h = (2166136261 ^ i) >>> 0;
  for (let c = 0; c < seed.length; c++) {
    h ^= seed.charCodeAt(c);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** Signed wander in viewBox units, from the label's own hash. */
const off = (seed: string, i: number, scale = 1) =>
  (rand(seed, i) - 0.5) * WANDER * scale;

function wobble(label: string) {
  const bumps = Math.max(3, Math.round(label.length / CHARS_PER_BUMP));
  const width = label.length * UNITS_PER_CHAR;
  const step = width / bumps;

  // Quadratics, not a polyline: the control point gets its own wander, so each
  // segment has a slight belly rather than being a straight ramp between two
  // jittered points.
  let d = `M ${(-step * OVERSHOOT).toFixed(2)} ${(BASELINE + off(label, 0)).toFixed(2)}`;
  for (let i = 1; i <= bumps; i++) {
    const cx = step * (i - 0.5);
    const cy = BASELINE + off(label, i + 101, 1.9);
    // The last point runs past the word's end, mirroring the lead-in.
    const x = i === bumps ? width + step * OVERSHOOT : step * i;
    const y = BASELINE + off(label, i);
    d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return { d, viewBox: `0 0 ${width} ${VB_HEIGHT}` };
}

/**
 * Drop inside an element carrying `wobble-link` (which owns the positioning
 * context and the hover rule). `label` is the seed as well as the sizing basis,
 * so pass the text the stroke sits under.
 */
export function WobbleUnderline({ label }: { label: string }) {
  const { d, viewBox } = wobble(label);
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio="none"
      // overflow-visible so the lead-in and the lift bleed past the label's
      // own box, which is the whole point of drawing them.
      className="wobble-underline pointer-events-none absolute left-0 top-full h-[0.55em] w-full overflow-visible"
    >
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
