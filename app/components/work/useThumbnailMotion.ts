"use client";

import { useEffect, useState, type RefObject } from "react";

// The live card thumbnails only animate while you're looking at one: hover on a
// pointer device, and simply "on screen" where hover doesn't exist (touch), so
// the motion isn't invisible on phones. Every live thumbnail takes the returned
// flag as its `active` prop and rests on a still frame when it's false.
export function useThumbnailMotion(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(hover: hover)").matches) {
      const on = () => setActive(true);
      const off = () => setActive(false);
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      return () => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
      };
    }

    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return active;
}
