"use client";

import { useEffect, useRef, useState } from "react";

// Live thumbnail for the DeepClean card. Unlike the other live thumbnails
// (which are CSS/SVG ports), this one stays as its prototype: the loop is
// ~130 lines of imperative JS that measures the terminal's real line positions
// to lower the spider down its thread to them, so an iframe keeps
// public/deepclean/motion-thumbnail.html as the single source of truth.
// pointer-events-none lets the card's own hover + CircleCursor label win, and
// the frame is inert to keyboard focus — it's decoration, described by the
// title. The page holds its poster frame until we post deepclean:play (and it
// still pauses itself while offscreen or the tab is hidden).
export function DeepCleanThumbnail({ active }: { active: boolean }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    frameRef.current?.contentWindow?.postMessage(
      active ? "deepclean:play" : "deepclean:pause",
      window.location.origin,
    );
  }, [active, loaded]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#141414]">
      <iframe
        ref={frameRef}
        src="/deepclean/motion-thumbnail.html"
        title="DeepClean: a pixel spider reviews a long Claude Code chat, asks before changing a stale pin, archives an off-topic thread, and frees up context"
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
