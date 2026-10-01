"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/app/lib/gsap";
import FootprintsHome from "@/app/components/home/FootprintsHome";
import { WobbleUnderline } from "@/app/components/shared/WobbleUnderline";

/**
 * The one footer for every page — footprint canvas + footprint picker + three
 * "what I'm into" columns + contact row + colophon.
 *
 * It's a CURTAIN: the panel is `fixed` to the bottom of the viewport, pinned
 * behind the page, and every page leaves a --footer-h tall gap below its own
 * opaque content. Scrolling to the end slides the page off the footer instead
 * of scrolling the footer into view, so the footer is uncovered in place.
 *
 * ...but only where the whole panel fits one viewport, which is the `curtain`
 * variant in globals.css (mirrored here as CURTAIN_MQ). On a phone the four
 * lists stack one per row and need ~700px against an iPhone SE's ~553px, and a
 * fixed panel taller than the viewport hides its own bottom where no scroll can
 * reach it. So outside that condition the curtain is dropped: the footer is a
 * static block at its natural height, the gap below the content collapses to
 * nothing, and the footer scrolls in like any other section.
 *
 * Two pieces, because `position: fixed` breaks inside a transformed ancestor:
 *   <SiteFooter />      the fixed panel — must live OUTSIDE ScrollSmoother's
 *                       #smooth-wrapper on the home.
 *   <FooterCurtainGap /> the empty space at the end of the scrolling content
 *                       that uncovers it (zero-height outside `curtain`, where
 *                       there is nothing to uncover), and the observer that
 *                       flips the global `.hero-active` (nav + cursor go paper)
 *                       once the footer is at least half revealed. The gap
 *                       reads true rendered geometry, so it works under both
 *                       the home's smoothed scroll and inner pages' native one.
 */

/** Phosphor cloud-sun and moon-stars, the two skies over the place line. */
const SUN_PATH =
  "M164,72a76.2,76.2,0,0,0-20.26,2.73,55.63,55.63,0,0,0-9.41-11.54l9.51-13.57a8,8,0,1,0-13.11-9.18L121.22,54A55.9,55.9,0,0,0,96,48c-.58,0-1.16,0-1.74,0L91.37,31.71a8,8,0,1,0-15.75,2.77L78.5,50.82A56.1,56.1,0,0,0,55.23,65.67L41.61,56.14a8,8,0,1,0-9.17,13.11L46,78.77A55.55,55.55,0,0,0,40,104c0,.57,0,1.15,0,1.72L23.71,108.6a8,8,0,0,0,1.38,15.88,8.24,8.24,0,0,0,1.39-.12l16.32-2.88a55.74,55.74,0,0,0,5.86,12.42A52,52,0,0,0,84,224h80a76,76,0,0,0,0-152ZM56,104a40,40,0,0,1,72.54-23.24,76.26,76.26,0,0,0-35.62,40,52.14,52.14,0,0,0-31,4.17A40,40,0,0,1,56,104ZM164,208H84a36,36,0,1,1,4.78-71.69c-.37,2.37-.63,4.79-.77,7.23a8,8,0,0,0,16,.92,58.91,58.91,0,0,1,1.88-11.81c0-.16.09-.32.12-.48A60.06,60.06,0,1,1,164,208Z";
const MOON_PATH =
  "M240,96a8,8,0,0,1-8,8H216v16a8,8,0,0,1-16,0V104H184a8,8,0,0,1,0-16h16V72a8,8,0,0,1,16,0V88h16A8,8,0,0,1,240,96ZM144,56h8v8a8,8,0,0,0,16,0V56h8a8,8,0,0,0,0-16h-8V32a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16Zm72.77,97a8,8,0,0,1,1.43,8A96,96,0,1,1,95.07,37.8a8,8,0,0,1,10.6,9.06A88.07,88.07,0,0,0,209.14,150.33,8,8,0,0,1,216.77,153Zm-19.39,14.88c-1.79.09-3.59.14-5.38.14A104.11,104.11,0,0,1,88,64c0-1.79,0-3.59.14-5.38A80,80,0,1,0,197.38,167.86Z";

/**
 * Sun or moon beside the place line, read off the real clock in San Francisco
 * rather than the visitor's own — the line is about where she is, so the sky
 * should be hers too.
 *
 * It renders nothing on the server and on the first client paint. The footer is
 * prerendered and cached, so a sun baked in at build time would be both a
 * hydration mismatch and, hours later, a lie. The icon fades in once the
 * browser has actually looked at a clock.
 */
function SkyMark() {
  const [isDay, setIsDay] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => {
      // hourCycle h23 so midnight is 0 and not 24.
      const hour = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "numeric",
          hourCycle: "h23",
        }).format(new Date()),
      );
      setIsDay(hour >= 6 && hour < 18);
    };
    read();
    // A tab left open overnight should cross dusk without a reload.
    const id = window.setInterval(read, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (isDay === null) return null;

  return (
    <span
      // Decorative: the sentence beside it already says where she is.
      aria-hidden
      // Keyed so the mark replays its entrance when the sky actually turns
      // over, instead of the moon silently replacing the sun.
      key={isDay ? "day" : "night"}
      className="sky-mark inline-flex shrink-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 256 256"
        fill="currentColor"
        focusable="false"
      >
        <path d={isDay ? SUN_PATH : MOON_PATH} />
      </svg>
    </span>
  );
}

type FooterItem = { label: string; href?: string; preview?: string };

/**
 * One frame for every hover preview: a portrait rectangle at book-jacket
 * proportions. The YouTube sources are square channel avatars, so they crop to
 * this rather than getting a shape of their own — everything hanging off the
 * footer reads as the same object, and nothing is round.
 */
const FRAME = { w: 176, h: 252 };

const COOKING: FooterItem[] = [
  { label: "Pastry puffs" },
  { label: "Aglio e olio" },
  { label: "Chocolate cakes" },
  { label: "Puffed rice salad" },
];

const READING: FooterItem[] = [
  {
    label: "India, that is Bharat",
    href: "https://www.bloomsbury.com/us/india-that-is-bharat-9789354352508/",
    preview: "/footer/reading/india-that-is-bharat.jpg",
  },
  {
    label: "Masala Lab",
    href: "https://www.goodreads.com/en/book/show/54968807-masala-lab",
    preview: "/footer/reading/masala-lab.jpg",
  },
];

const LEARNING: FooterItem[] = [
  { label: "Motion design on Cavalry" },
  { label: "Loop engineering" },
  { label: "Mastering evals" },
];

const WATCHING: FooterItem[] = [
  {
    label: "Lenny's Podcast",
    href: "https://www.youtube.com/@LennysPodcast",
    preview: "/footer/watching/lennys-podcast.jpg",
  },
  {
    label: "Pick Up Limes",
    href: "https://www.youtube.com/@PickUpLimes",
    preview: "/footer/watching/pick-up-limes.jpg",
  },
];

const FOOTER_LINK_CLASS =
  "wobble-link font-mono text-caption-1 uppercase opacity-65 transition-opacity duration-150 hover:opacity-100";

/** Same rhythm as the links, minus the affordances — these go nowhere. */
const FOOTER_TEXT_CLASS = "font-mono text-caption-1 uppercase opacity-65";

function FooterColumn({
  label,
  items,
  onPreview,
}: {
  label: string;
  items: FooterItem[];
  onPreview: (src: string | null) => void;
}) {
  return (
    <div className="flex flex-col items-start">
      {/* Homemade Apple, matching the case-study eyebrows. It ships one weight
          and its capitals are wide and loose, so the mono heading's
          `font-medium` and `uppercase` come off with it — at 13px uppercase it
          reads as scribble rather than as a word. */}
      <p className="font-apple text-eyebrow">{label}</p>
      {/* pointer-events-auto so links stay clickable while the surrounding
          footer stays transparent to the footprint engine underneath. The
          tighter top margin on a phone keeps the stacked lists compact, since
          there they are four rows rather than one. */}
      <ul className="pointer-events-auto mt-3 flex flex-col gap-2 sm:mt-6">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={FOOTER_LINK_CLASS}
                onPointerEnter={() => onPreview(item.preview ?? null)}
                onPointerLeave={() => onPreview(null)}
              >
                {item.label}
                <WobbleUnderline label={item.label} />
              </a>
            ) : (
              <span className={FOOTER_TEXT_CLASS}>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Where the footer is still a fixed curtain — the JS twin of the `curtain`
 * variant in globals.css. Keep the two literally in step: the panel's layout
 * comes from the variant, while the reveal sensor and the home's ScrollSmoother
 * read this.
 */
export const CURTAIN_MQ = "(min-width: 40rem) and (min-height: 34rem)";

/**
 * Flips the global `.hero-active` (nav + cursor go paper, and the footer's
 * ambient walkers start) once the watched element is at least half on screen.
 *
 * Which element that is depends on the layout: under `curtain` it is the gap,
 * because half the gap showing is half the footer uncovered; outside it the
 * footer scrolls in on its own and watches itself. `forCurtain` says which of
 * the two this caller is, and the sensor only arms itself when the viewport
 * agrees, so the gap and the panel can never fight over the class.
 */
function useRevealSensor(
  ref: React.RefObject<HTMLElement | null>,
  forCurtain: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(CURTAIN_MQ);
    let io: IntersectionObserver | null = null;
    const sync = () => {
      io?.disconnect();
      io = null;
      if (mq.matches !== forCurtain) return;
      io = new IntersectionObserver(
        ([entry]) => {
          document.documentElement.classList.toggle(
            "hero-active",
            entry.intersectionRatio >= 0.5,
          );
        },
        { threshold: [0, 0.5, 1] },
      );
      io.observe(el);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      io?.disconnect();
      document.documentElement.classList.remove("hero-active");
    };
  }, [ref, forCurtain]);
}

/**
 * The empty space at the tail of the scrolling content that uncovers the fixed
 * footer. Goes last inside whatever element actually scrolls (#smooth-content
 * on the home, the flex column on inner pages), directly after the page's own
 * opaque content — and never inside it, or the page would paint over the gap.
 *
 * It doubles as the reveal sensor: once half of it is on screen, half the
 * footer is showing, and the nav + cursor flip to paper.
 */
export function FooterCurtainGap() {
  const ref = useRef<HTMLDivElement>(null);
  // Only where the gap has a height. Outside `curtain` it is zero-height, and
  // the IntersectionObserver spec reports ratio 1 for a zero-area target the
  // moment it intersects — which would latch `.hero-active` on for the whole
  // page. There the footer watches itself instead (see useRevealSensor).
  useRevealSensor(ref, true);

  return <div ref={ref} aria-hidden className="h-0 shrink-0 curtain:h-[var(--footer-h)]" />;
}

/** Where the bottom bar sits, and the breath it needs above the columns —
 *  shared by the class names below and by the height measurement, so the two
 *  cannot drift. */
const BAR_INSET = 32; // bottom-8
const BAR_GAP = 28; // breath between the last list and the bar

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // `preview` is kept after the pointer leaves so the card fades out still
  // holding its image rather than going blank mid-transition.
  const [preview, setPreview] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  const showPreview = (src: string | null) => {
    if (src) setPreview(src);
    setShown(Boolean(src));
  };

  /**
   * Publish the footer's real content height, which is what --footer-h takes
   * the max of (see globals.css). Everything in the panel is absolutely
   * positioned, so content taller than --footer-h is clipped instead of
   * pushing the panel open — and on a narrow phone, where the list items wrap
   * onto two lines, the flat 560px it used to be was already too short.
   * Measuring beats a hand-tuned height per breakpoint: it is right at every
   * width, and it stays right when the lists are edited.
   *
   * It can only ever ask for more room, never less than the floor, and
   * globals.css caps the result at one viewport — the panel is fixed, so a
   * taller one would hide its own top where nothing can scroll to it.
   *
   * Both measured elements are natural-height (the columns block is a
   * non-growing child of a min-h-full flex column; the bar is absolute), so
   * neither one's height depends on --footer-h. That is what keeps this from
   * latching: if it measured something stretched to the panel, growing the
   * panel would grow the measurement and the footer could never shrink back
   * after a rotate.
   */
  useEffect(() => {
    const columns = columnsRef.current;
    const bar = barRef.current;
    if (!columns || !bar) return;
    const root = document.documentElement;
    const apply = () => {
      const needed =
        columns.offsetHeight + BAR_GAP + bar.offsetHeight + BAR_INSET;
      root.style.setProperty("--footer-content-h", `${Math.ceil(needed)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(columns);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--footer-content-h");
    };
  }, []);

  /**
   * The hover preview rides the cursor on its own eased follow, so it trails
   * the pointer rather than snapping to it. Positioned with fixed coords from
   * the raw pointer event — no getBoundingClientRect, so it stays correct under
   * the home's smoothed (transformed) scroll.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const card = previewRef.current;
    if (!card) return;
    const xTo = gsap.quickTo(card, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  // Outside `curtain` the panel scrolls in on its own, so it is its own reveal
  // sensor; under `curtain` the gap owns the flip and this stays dormant.
  useRevealSensor(ref, false);

  return (
    // Under `curtain`: pinned behind the page, uncovered by the gap below the
    // content. Outside it: a static block at its natural height, in flow after
    // the page, scrolling in like any other section.
    <section
      ref={ref}
      className="relative z-10 w-full curtain:fixed curtain:bottom-0 curtain:left-0 curtain:z-0 curtain:h-[var(--footer-h)]"
    >
      <FootprintsHome footprintPicker inverted introWalk="cross" awaitReveal flowHeight>
        {/* Four columns + contact row + colophon. The wrapper is
            pointer-events-none so footprints spawn in the gaps; links opt in.
            min-h-full only under `curtain`, where the panel has a height to
            fill; outside it the content IS the height, and stretching to a
            parent that is sized by this would be circular. */}
        <div className="pointer-events-none relative mx-auto flex max-w-[1140px] flex-col px-5 curtain:min-h-full sm:px-8">
          {/* The measured block. Its own padding is inside the measurement, and
              min-h-full sits on the parent rather than here so this stays
              natural-height — see the note on the effect above.

              One column on a phone, 2x2 from sm, four across from md. */}
          <div
            ref={columnsRef}
            className="grid grid-cols-1 gap-x-6 gap-y-6 pt-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12 sm:pt-28 md:grid-cols-4 md:gap-x-10 lg:gap-x-14"
            data-quiet
          >
            <FooterColumn label="cooking" items={COOKING} onPreview={showPreview} />
            <FooterColumn label="reading" items={READING} onPreview={showPreview} />
            <FooterColumn label="watching" items={WATCHING} onPreview={showPreview} />
            <FooterColumn label="learning" items={LEARNING} onPreview={showPreview} />
          </div>
        </div>

        {/* Bottom bar — copyright, place, last updated, evenly spread on the
            same h-9 baseline as the footprint picker FootprintsHome anchors to
            the right. The three lines only go side by side at lg, not sm: laid
            out as a row they need about 670px of clear width, and a 768px
            tablet has 640px once the gutters and the picker's berth are taken
            out, so at sm the last line ran off the right edge. Below lg they
            stack instead.

            Outside `curtain` it is in flow, directly after the lists, so it
            scrolls with them. Under `curtain` it goes back to being absolutely
            pinned to the bottom of the panel, OUTSIDE the max-w-[1140px]
            column on purpose —
            anchored to that column it was inset by the centring gutter on wide
            screens, which read as floating rather than as a corner. The picker
            cluster it pairs with is anchored to the footer edge the same way,
            hence the right padding that keeps the last line clear of it. */}
        <div
          ref={barRef}
          data-quiet
          className="pointer-events-none mx-5 mt-7 mb-8 flex flex-col gap-1 pr-14 font-mono text-caption-1 uppercase opacity-70 sm:gap-1.5 sm:pr-16 curtain:absolute curtain:bottom-8 curtain:left-8 curtain:right-8 curtain:mx-0 curtain:mt-0 curtain:mb-0 lg:h-9 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
        >
          <p className="whitespace-nowrap">Copyright @ shruthi aragonda</p>
          <p className="flex items-center gap-1.5 whitespace-nowrap">
            <SkyMark />
            Lives in San Francisco, California
          </p>
          <p className="whitespace-nowrap">Last updated on {process.env.NEXT_PUBLIC_LAST_UPDATED}</p>
        </div>
      </FootprintsHome>

      {/* One follower for the whole footer — cheaper than a node per link, and
          it keeps its eased position while the hovered item changes under it.
          Hidden from assistive tech and from touch (no hover to trigger it). */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
      >
        <div
          className="overflow-hidden rounded-sm shadow-2xl transition-[opacity,transform] duration-300 ease-out"
          style={{
            width: FRAME.w,
            height: FRAME.h,
            opacity: shown ? 1 : 0,
            // Centring lives here, not on the follower: GSAP owns the
            // follower's transform and would overwrite a translate on it.
            transform: `translate(-50%, calc(-50% - 1.5rem)) scale(${shown ? 1 : 0.94})`,
          }}
        >
          {preview ? (
            <Image
              src={preview}
              alt=""
              width={FRAME.w}
              height={FRAME.h}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
