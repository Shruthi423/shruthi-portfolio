/**
 * The footprint vocabulary: which animals exist, the hues their prints are
 * mixed from, and the raw track geometry.
 *
 * It lives in lib rather than in FootprintsHome because three places need it
 * now and they must not disagree: the print engine itself, ThemeProvider (which
 * holds the chosen animal and paints the favicon), and anything else that wants
 * to draw a track. The shapes are raw SVG markup strings, not JSX, so the
 * favicon can serialize them into a data: URI without a second copy of the
 * geometry drifting out of sync.
 */

import type { CSSProperties } from "react";

export const FOOTPRINT_ANIMALS = [
  "lion",
  "giraffe",
  "duck",
  "hippo",
  "zebra",
] as const;
export type FootprintAnimal = (typeof FOOTPRINT_ANIMALS)[number];

// The page's surface colours, mirroring :root in globals.css. Canvas and SVG
// can't read CSS vars, so the real values live here too. There's no dark
// polarity any more: `footer` is the footer panel, not a night mode.
//
// `footer` is deliberately its own value rather than reusing `ink`: ink is the
// site's text colour, and the footer panel is now a hue (the palette's plum,
// pushed dark). It holds 10.3:1 against paper, so the 13px mono on it stays
// well clear of AA, and being warm it lets the orange/pink prints glow instead
// of fighting them.
export const SURFACE = { paper: "#fafaf8", ink: "#202422", footer: "#5e2f40" } as const;

/**
 * The footer panel's rotation. It drifts from one of these to another every
 * few seconds (see FootprintsHome's inverted colour loop), so the footer is
 * never quite the same colour twice.
 *
 * Hand-picked, not random in colour space: paper mono at 13px sits on this
 * panel, so every entry has to carry it. The weakest here (deep forest) is
 * 8.4:1 against paper and the strongest is 13.2:1 — all far clear of AA. They
 * are also deliberately spread across the wheel so a change reads as a change.
 *
 * `SURFACE.footer` is the first of them and the value that shows when motion is
 * off; `--invert-bg` in globals.css must hold the same hex, since the nav scrim
 * and the cursor label start from there.
 */
export const FOOTER_HUES = [
  "#5e2f40", // plum, pushed dark
  "#3b2540", // aubergine
  "#2d2a6e", // indigo
  "#123b36", // teal ink
  "#10553c", // deep forest
] as const;

// The site palette, straight from the @theme block in globals.css. Canvas + SVG
// can't read CSS vars, so the hex values live here.
export const HUES = {
  paleBlue: "#cce1f2",
  blue: "#9fc4e8",
  lavender: "#cfa4cc",
  lime: "#cee295",
  forest: "#1a9562",
  orange: "#ee5a36",
  pink: "#d9538a",
  plum: "#8e4a63",
} as const;

/**
 * The palette again, in the variants that survive being set at display size on
 * the #fafaf8 paper.
 *
 * Same split, and the same reason, as PROJECT_ACCENTS below: lavender, lime and
 * the blues sit near 1.9:1 as raw palette values, which is fine for a wash and
 * illegible for a headline. These are the darkened cousins (the exact values the
 * case studies already use for their typographic accents), so the hero can rotate
 * through eight hues without one of them dropping out of readability.
 *
 * `teal` is not from the @theme palette at all: it is the footer rotation's
 * teal ink, borrowed so the hero's opening word has a hue of its own. Every
 * other entry here was already claimed by a verb, and the site was already
 * wearing this one a few hundred pixels further down the page.
 *
 * Charcoal stays in here as `ink` even though no verb deals it any more: it is
 * the page's own text colour and the value anything wanting the darkest tier
 * should reach for.
 */
export const INK_HUES = {
  ink: SURFACE.ink,
  teal: "#123b36",
  orange: HUES.orange,
  forest: HUES.forest,
  pink: HUES.pink,
  plum: HUES.plum,
  lavender: "#9a5f96",
  blue: "#334eac",
  lime: "#5d7430",
} as const;

/**
 * Per-project accents. Every case study scopes `--accent` to its own hue on its
 * root wrapper, so one project never borrows another's colour.
 *
 * Two values, not one: the palette's light hues (lavender, lime) sit around
 * 1.9:1 on the off-white page, which is fine for a rail or a fill and unreadable
 * for a mono eyebrow or a stat number. `tint` is the wash, `text` is the
 * darkened variant everything typographic uses. Where the hue is already dark
 * enough (forest, orange, plum) `text` is just the palette value.
 */
export type ProjectAccent = { tint: string; text: string };

export const PROJECT_ACCENTS = {
  kodif: { tint: "#f2a9c6", text: HUES.pink },
  zuge: { tint: "#7fd4ae", text: HUES.forest },
  // The 9and9 temple study, which held the site's default orange first.
  temple: { tint: "#f6a48d", text: HUES.orange },
  feeld: { tint: HUES.lavender, text: "#9a5f96" },
  onki: { tint: "#c98fa5", text: HUES.plum },
  "handmade-homestead": { tint: HUES.lime, text: "#5d7430" },
  // Domu carries its own product blue rather than the palette's pale one, so
  // the case study and the embedded explainer agree on a single hue.
  domu: { tint: HUES.blue, text: "#334eac" },
} as const satisfies Record<string, ProjectAccent>;

export type ProjectAccentKey = keyof typeof PROJECT_ACCENTS;

/**
 * The style object a case study spreads onto its root wrapper: it rebinds
 * `--accent` (read by every eyebrow, rail dot, number and mark on the page) and
 * adds `--accent-tint` for fills and washes.
 */
export function accentVars(key: keyof typeof PROJECT_ACCENTS) {
  const { tint, text } = PROJECT_ACCENTS[key];
  return { "--accent": text, "--accent-tint": tint } as CSSProperties;
}

// Hand-picked three-hue blends. Each spawn grabs one at random and rotates it,
// so a trail never repeats the same wash twice in a row.
export const BLENDS: readonly (readonly [string, string, string])[] = [
  [HUES.paleBlue, HUES.lavender, HUES.orange],
  [HUES.lime, HUES.paleBlue, HUES.forest],
  [HUES.blue, HUES.lavender, HUES.lime],
  [HUES.orange, HUES.lime, HUES.blue],
  [HUES.lavender, HUES.blue, HUES.paleBlue],
  [HUES.forest, HUES.lime, HUES.paleBlue],
  [HUES.paleBlue, HUES.orange, HUES.lavender],
];

// One fixed blend for the places that must not flicker or re-roll: the favicon,
// and anything else standing in for the site as a mark. Warm → cool, and every
// stop holds up on both the off-white and the charcoal tile.
export const SIGNATURE_BLEND: readonly [string, string, string] = [
  HUES.orange,
  HUES.lavender,
  HUES.forest,
];

// Track geometry, drawn for a 0 0 100 110 box. Shared by the cursor prints, the
// picker icons and the favicon.
export const SHAPES: Record<FootprintAnimal, string> = {
  lion:
    '<ellipse cx="50" cy="74" rx="27" ry="23"/>' +
    '<ellipse cx="20" cy="42" rx="9" ry="13"/>' +
    '<ellipse cx="41" cy="27" rx="9" ry="14"/>' +
    '<ellipse cx="62" cy="27" rx="9" ry="14"/>' +
    '<ellipse cx="81" cy="42" rx="9" ry="13"/>',
  giraffe:
    '<ellipse cx="37" cy="58" rx="14" ry="40" transform="rotate(-7 37 58)"/>' +
    '<ellipse cx="63" cy="58" rx="14" ry="40" transform="rotate(7 63 58)"/>',
  hippo:
    '<path d="M50 10 C64 10 71 21 67 31 C66 35 65 36 72 41 C84 47 84 61 77 76 C72 89 69 99 58 99 C53 99 51 91 50 84 C49 91 47 99 42 99 C31 99 28 89 23 76 C16 61 16 47 28 41 C35 36 34 35 33 31 C29 21 36 10 50 10 Z"/>',
  zebra:
    '<path d="M30 13 C36 16 44 30 49 48 Q50 53 51 48 C56 30 64 16 70 13 C80 16 84 40 83 60 C82 82 72 99 50 99 C28 99 18 82 17 60 C16 40 20 16 30 13 Z"/>',
  duck: '<path d="M50 95 L26 32 Q40 47 50 30 Q60 47 74 32 Z"/>',
};

/**
 * The favicon as a standalone SVG string: just the lion track, filled with
 * the signature gradient and stippled by the same turbulence filter the live
 * prints use — no background tile, so it sits transparent in the tab.
 * Always the lion, regardless of which animal is chosen elsewhere on the site.
 */
export function footprintTileSvg() {
  const [c0, c1, c2] = SIGNATURE_BLEND;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">` +
    `<defs>` +
    `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="40" y1="40" x2="216" y2="216">` +
    `<stop offset="0%" stop-color="${c0}"/>` +
    `<stop offset="50%" stop-color="${c1}"/>` +
    `<stop offset="100%" stop-color="${c2}"/>` +
    `</linearGradient>` +
    // Same recipe as the live prints, dialled back: at 16px a heavy stipple
    // just reads as a dirty edge, so the displacement and blur are smaller and
    // the alpha floor is higher.
    `<filter id="f" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="rough"/>` +
    `<feGaussianBlur in="rough" stdDeviation="1.6" result="soft"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0.62" result="grain"/>` +
    `<feComposite in="soft" in2="grain" operator="in"/>` +
    `</filter>` +
    `</defs>` +
    // 0 0 100 110 geometry scaled to fill the 256 viewBox with a margin.
    `<g transform="translate(43 26) scale(1.7)" fill="url(#g)" filter="url(#f)">` +
    SHAPES.lion +
    `</g></svg>`
  );
}
