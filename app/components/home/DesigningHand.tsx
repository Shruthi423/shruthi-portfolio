"use client";

import { useEffect, useId, useState } from "react";

/**
 * "Designing", written rather than typed.
 *
 * The word is set in Homemade Apple and revealed by a pen: a single stroke
 * that travels the letters in the order a hand would make them, used as the
 * mask over the filled glyphs. Ink therefore appears exactly where the nib
 * has passed and nowhere else, so the D's flourish flicks up before its bowl
 * closes, the g's tail swings down and back before the word carries on, and
 * both i-dots land after their letters instead of with them.
 *
 * PEN_PATH is hand-traced against the real Homemade Apple outlines at
 * 1024 units per em, glyph by glyph, each letter offset by the advance
 * widths ahead of it. It is not decorative: every curve of it sits on the
 * centre of a stroke in the typeface, which is the only reason a mask this
 * crude (one fat round-capped line) reads as handwriting. Retrace it against
 * the font if the face ever changes; nothing about it survives a swap.
 *
 * The glyphs themselves are a live <text>, not baked outlines — 26KB of path
 * data to ship a word the browser already has. The cost is that the mask has
 * nothing sensible to sit on until the webfont arrives, so the whole thing
 * waits on document.fonts.ready rather than flashing a fallback face at the
 * head of the one sentence on the page.
 */

/** Units per em of Homemade Apple, and the font-size the <text> is set at, so
 *  that one SVG user unit is one font unit and PEN_PATH needs no conversion. */
const UPM = 1024;

/** The viewBox, in font units with y pointing down (so the baseline is y=0).
 *  Wider and taller than the word's advance width because this face overhangs
 *  in every direction: the D's entry swash starts left of the origin, the
 *  final g's tail ends past the last advance, and that g drops to -815. */
const VB = { x: -300, y: -1000, w: 5700, h: 1850 };

/** Em height of the word, relative to the sentence's font-size. Chosen between
 *  matching Ovo's x-height (0.99, which makes the capital tower) and matching
 *  its cap height (0.72, which shrinks the lowercase to nothing) — handwriting
 *  wants the taller capital, but not all of it. 0.88 is the same 60/40 blend of
 *  the two that every other word's `em` in RotatingWord's face table is, so the
 *  written word is the same size as the set ones; it is also the value at which
 *  "Untangling", the other word in this face, comes out level with the slot.
 *  The rendered box is 4.89em wide, inside the slot "Prototyping" still pins,
 *  so the sentence does not change length. */
const SCALE = 0.88;

/** How long the hand takes to write the whole word. Every stroke is revealed
 *  at a constant rate along its own length and takes its share of this, which
 *  is what keeps the nib moving at one speed through the loops as well as the
 *  straights. */
const WRITE_MS = 1500;

/** Wide enough to cover the typeface's stroke thickness (~110 units) plus the
 *  slack in a hand-traced centreline. Wider than this and the nib starts
 *  lighting up the neighbouring limb of a loop before it gets there. */
const NIB = 262;

/** The pen, as the twelve strokes it is actually made of: one per unbroken
 *  run of the nib, with the pen lifts between them (the D's flourish leaving
 *  the bowl, each i leaving its dot) as the gaps. They are stored apart rather
 *  than as one path with subpaths because SVG restarts a dash pattern at every
 *  subpath — one dashoffset over the lot reveals each stroke whole, all at
 *  once, instead of drawing through them. Each is its own element instead,
 *  taking a share of the write proportional to its length, so the nib crosses
 *  the word at one speed.
 *
 *  `len` is the stroke's own measured length, used both as its dash pattern
 *  and as its share of the clock. Regenerate the two together or the word
 *  writes itself at the wrong speed and stops short. */
const PEN_STROKES: readonly { len: number; d: string }[] = [
  { len: 867, d: "M-245 15C-231 3-192-28-160-55C-128-82-92-117-55-150C-18-183 24-218 60-255C96-292 128-331 160-370C192-409 222-448 250-490C278-532 317-602 330-625" },
  { len: 2982, d: "M140-330C139-353 132-425 132-470C132-515 135-552 140-600C145-648 148-718 160-760C172-802 188-828 215-855C242-882 284-911 320-925C356-939 393-943 430-940C467-937 512-923 540-905C568-887 585-864 600-830C615-796 623-745 628-700C633-655 633-607 630-560C627-513 621-465 612-420C603-375 597-320 575-290C553-260 518-249 480-238C442-227 390-220 350-222C310-224 270-253 240-248C210-243 185-214 170-190C155-166 147-134 148-105C149-76 158-40 178-15C198 10 230 33 265 42C300 51 348 49 385 38C422 27 462 0 490-25C518-50 527-86 555-115C583-144 622-182 660-198C698-214 746-207 780-210C814-213 848-215 862-216" },
  { len: 1986, d: "M877-190C895-190 950-191 985-192C1020-193 1061-194 1089-198C1117-202 1137-203 1155-218C1173-233 1188-260 1195-288C1202-316 1206-358 1199-388C1192-418 1174-451 1152-468C1130-485 1100-494 1069-492C1038-490 997-473 963-455C929-437 889-408 863-382C837-356 817-326 809-296C801-266 805-236 813-205C821-174 838-137 859-110C880-83 911-56 942-42C973-28 1011-23 1045-28C1079-33 1112-49 1145-70C1178-91 1209-128 1245-155C1281-182 1322-208 1359-232C1396-256 1439-280 1469-298C1499-316 1526-333 1537-340" },
  { len: 1998, d: "M1285-285C1297-273 1337-242 1355-215C1373-188 1395-152 1395-120C1395-88 1370-43 1355-20C1340 3 1300 32 1305 20C1310 8 1357-53 1385-90C1413-127 1443-162 1475-200C1507-238 1540-277 1575-315C1610-353 1658-406 1685-430C1712-454 1718-463 1737-458C1756-453 1784-426 1797-400C1810-374 1816-337 1815-300C1814-263 1805-213 1793-178C1781-143 1763-115 1745-92C1727-69 1671-49 1683-42C1695-35 1773-40 1815-52C1857-64 1898-87 1935-112C1972-137 2011-177 2035-200C2059-223 2072-242 2080-250" },
  { len: 801, d: "M2085-300C2077-285 2052-245 2037-210C2022-175 1996-125 1995-92C1994-59 2010-28 2032-10C2054 8 2095 16 2127 18C2159 20 2193 10 2222 5C2251 0 2276 1 2302-15C2328-31 2358-66 2379-92C2400-118 2419-155 2427-168" },
  { len: 117, d: "M2199-668C2198-649 2193-571 2192-552" },
  { len: 4198, d: "M2318-108C2337-106 2396-95 2433-96C2470-97 2510-107 2543-116C2576-125 2607-136 2633-152C2659-168 2676-189 2698-215C2720-241 2744-278 2763-310C2782-342 2801-381 2811-405C2821-429 2836-448 2821-452C2806-456 2761-448 2723-432C2685-416 2638-382 2593-355C2548-328 2491-297 2453-272C2415-247 2384-224 2363-205C2342-186 2315-177 2325-160C2335-143 2385-113 2423-105C2461-97 2522-118 2553-110C2584-102 2605-80 2608-55C2611-30 2591 8 2573 40C2555 72 2526 108 2499 139C2472 170 2442 198 2410 228C2378 258 2345 286 2310 317C2275 348 2232 384 2199 417C2166 450 2136 484 2110 517C2084 550 2058 586 2043 617C2028 648 2013 675 2021 700C2029 725 2063 752 2093 765C2123 778 2168 786 2203 775C2238 764 2271 729 2303 700C2335 671 2366 633 2393 600C2420 567 2446 530 2468 500C2490 470 2507 447 2523 420C2539 393 2552 362 2565 339C2578 316 2592 304 2603 285C2614 266 2620 256 2632 228C2644 200 2661 150 2676 117C2691 84 2702 58 2721 28C2740-2 2763-35 2787-61C2811-87 2834-102 2865-128C2896-154 2943-189 2976-217C3009-245 3050-281 3065-294" },
  { len: 1398, d: "M3004 18C3009 2 3022-47 3032-80C3042-113 3051-148 3062-180C3073-212 3084-244 3096-272C3108-300 3123-342 3132-345C3141-348 3146-308 3152-288C3158-268 3153-231 3166-228C3179-225 3202-248 3229-268C3256-288 3300-326 3329-348C3358-370 3383-386 3404-400C3425-414 3444-442 3454-432C3464-422 3462-370 3462-340C3462-310 3458-284 3454-255C3450-226 3444-193 3439-168C3434-143 3420-124 3422-105C3424-86 3440-66 3454-55C3468-44 3487-40 3509-38C3531-36 3572-41 3584-42" },
  { len: 801, d: "M3731-300C3723-285 3698-245 3683-210C3668-175 3642-125 3641-92C3640-59 3656-28 3678-10C3700 8 3741 16 3773 18C3805 20 3839 10 3868 5C3897 0 3922 1 3948-15C3974-31 4004-66 4025-92C4046-118 4065-155 4073-168" },
  { len: 117, d: "M3845-668C3844-649 3839-571 3838-552" },
  { len: 1398, d: "M3989 18C3994 2 4007-47 4017-80C4027-113 4036-148 4047-180C4058-212 4069-244 4081-272C4093-300 4108-342 4117-345C4126-348 4131-308 4137-288C4143-268 4138-231 4151-228C4164-225 4187-248 4214-268C4241-288 4285-326 4314-348C4343-370 4368-386 4389-400C4410-414 4429-442 4439-432C4449-422 4447-370 4447-340C4447-310 4443-284 4439-255C4435-226 4429-193 4424-168C4419-143 4404-124 4407-105C4410-86 4424-66 4439-55C4454-44 4472-40 4494-38C4516-36 4556-41 4569-42" },
  { len: 4198, d: "M4563-108C4582-106 4640-95 4678-96C4716-97 4755-107 4788-116C4821-125 4852-136 4878-152C4904-168 4921-189 4943-215C4965-241 4989-278 5008-310C5027-342 5046-381 5056-405C5066-429 5081-448 5066-452C5051-456 5006-448 4968-432C4930-416 4883-382 4838-355C4793-328 4736-297 4698-272C4660-247 4629-224 4608-205C4587-186 4560-177 4570-160C4580-143 4630-113 4668-105C4706-97 4767-118 4798-110C4829-102 4850-80 4853-55C4856-30 4836 8 4818 40C4800 72 4771 108 4744 139C4717 170 4686 198 4655 228C4624 258 4590 286 4555 317C4520 348 4477 384 4444 417C4411 450 4381 484 4355 517C4329 550 4303 586 4288 617C4273 648 4258 675 4266 700C4274 725 4308 752 4338 765C4368 778 4413 786 4448 775C4483 764 4516 729 4548 700C4580 671 4610 633 4638 600C4666 567 4691 530 4713 500C4735 470 4752 447 4768 420C4784 393 4797 362 4810 339C4823 316 4837 304 4848 285C4859 266 4865 256 4877 228C4889 200 4906 150 4921 117C4936 84 4948 58 4966 28C4984-2 5008-35 5032-61C5056-87 5078-102 5110-128C5142-154 5188-189 5221-217C5254-245 5295-281 5310-294" },
];

/** Sum of the above. */
const PEN_LENGTH = 20861;

export default function DesigningHand({
  landed,
  calm,
  pulse,
}: {
  /** Whether the word is on screen and allowed to play. */
  landed: boolean;
  /** Reduced motion: the word is simply already written. */
  calm: boolean;
  /** Flip counter. The animation is keyed on it so the word rewrites itself
   *  every time it comes back around, rather than playing once on mount. */
  pulse: number;
}) {
  // useId's raw value carries punctuation (React 19 wraps it in guillemets),
  // and url(#...) will not resolve an id containing it — the mask is then
  // silently ignored and the whole word renders at once, already written.
  const maskId = `designing-write-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // The mask has nothing to bite on until Homemade Apple is loaded, so hold
  // the word back rather than write a fallback face and swap it mid-stroke.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!document.fonts) return setReady(true);
    let live = true;
    document.fonts.ready.then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  const drawing = ready && (calm || landed);

  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      // Inline-level, not block: vertical-align below only applies to an
      // inline-level box. As a block the svg sat its bottom edge on the line
      // and the whole word hung an eighth of an em high.
      className="inline-block"
      style={{
        width: `${(VB.w / UPM) * SCALE}em`,
        height: `${(VB.h / UPM) * SCALE}em`,
        // The viewBox carries 850 units of descender below the baseline; an
        // inline svg otherwise sits its bottom edge on the line, which would
        // hang the whole word an eighth of an em high.
        verticalAlign: `${-(850 / UPM) * SCALE}em`,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={VB.x}
          y={VB.y}
          width={VB.w}
          height={VB.h}
        >
          {PEN_STROKES.map((stroke, i) => {
            // Where this stroke falls in the word, as a fraction of the whole
            // write — so the nib arrives at the g's tail at the same moment
            // however the strokes are split.
            const before = PEN_STROKES.slice(0, i).reduce(
              (sum, s) => sum + s.len,
              0,
            );
            return (
              <path
                // Keyed on the flip counter: a node that is never unmounted
                // plays its keyframes once and then sits finished for every
                // loop after.
                key={`${pulse}-${i}`}
                d={stroke.d}
                fill="none"
                stroke="#fff"
                strokeWidth={NIB}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: stroke.len,
                  strokeDashoffset: calm ? 0 : stroke.len,
                  animation:
                    drawing && !calm
                      ? `verb-write ${(stroke.len / PEN_LENGTH) * WRITE_MS}ms linear ${
                          (before / PEN_LENGTH) * WRITE_MS
                        }ms forwards`
                      : undefined,
                }}
              />
            );
          })}
        </mask>
      </defs>
      <text
        x={0}
        y={0}
        fill="currentColor"
        mask={`url(#${maskId})`}
        style={{
          fontFamily: "var(--font-apple)",
          fontSize: UPM,
          fontKerning: "none",
          // Nothing is written until the face that the pen was traced against
          // is the face on screen.
          opacity: ready ? 1 : 0,
        }}
      >
        Designing
      </text>
    </svg>
  );
}
