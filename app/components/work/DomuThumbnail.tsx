"use client";

import { useEffect, useRef, useState } from "react";

// Live thumbnail for the Domu card: the study's argument in one gesture. It
// rests on the scorecard the project argues against — one resolution rate, with
// every transfer under it counted as a failure — and on domu:play that red bar
// breaks apart and sorts itself, most of it turning green, three squares out of
// thirty-six staying red. Resting on the "before" means the card carries a
// number rather than a diagram, and the payoff only spends motion while someone
// is actually looking.
//
// Like DeepClean, the loop stays as its prototype in an iframe
// (public/domu/motion-thumbnail.html is the single source of truth) rather than
// being re-ported to CSS, so the case-study explainer and the card can't drift
// apart. The ground is the same blue-grey as the explainer's stage, so the card
// and the film read as one piece and both stand clear of the grid's off-white
// page. pointer-events-none lets the card's own hover + CircleCursor label win,
// and the frame is inert to keyboard focus — it's decoration, described by the
// title.
//
// On hover the whole frame eases in a few percent, the same gesture the still
// cards make (ProjectCard's mockup lifts and scales), so the card answers the
// pointer before the loop gets to its payoff. It's a transform on the iframe,
// so it composites and doesn't reflow the loop inside.
export function DomuThumbnail({ active }: { active: boolean }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    frameRef.current?.contentWindow?.postMessage(
      active ? "domu:play" : "domu:pause",
      window.location.origin,
    );
  }, [active, loaded]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E6ECF8]">
      <iframe
        ref={frameRef}
        src="/domu/motion-thumbnail.html"
        title="Domu: a resolution-rate scorecard counting every transfer as a failure, breaking apart into the handoffs that worked as intended and the few that were real mistakes"
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none absolute inset-0 h-full w-full border-0 transition-transform duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:scale-100 ${
          active ? "scale-[1.07]" : "scale-100"
        }`}
      />
    </div>
  );
}
