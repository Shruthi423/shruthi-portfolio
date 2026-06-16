"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SkyScene, FogReveal } from "./Background";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer, FOOTER_HEIGHT } from "./Footer";
import { InnerTopBar } from "./InnerTopBar";

/**
 * Route-aware shell. The home (`/`) is the footprints page — it renders bare,
 * providing its own full-screen chrome. Every inner page gets the top bar,
 * the sticky sky backdrop, and the curtain-reveal footer.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isHome = path === "/";

  // The home is a fixed, single-screen slider, so it locks body scroll. Owning
  // that lock here (route-aware) instead of inside a home-only component makes
  // it impossible to leak: every navigation re-runs this, locking on "/" and
  // unconditionally clearing it on every inner page — so inner pages always
  // scroll, even arriving straight from the home.
  useEffect(() => {
    document.body.style.overflow = isHome ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isHome]);

  if (isHome) return <>{children}</>;

  return (
    <>
      <InnerTopBar />
      <main
        className="relative z-10 flex-1"
        style={{ marginBottom: FOOTER_HEIGHT }}
      >
        {/* Sticky sky backdrop — clouds stay while content scrolls over, then
            scrolls away to reveal the footer. */}
        <div className="sticky top-0 h-screen" style={{ zIndex: 0 }}>
          <SkyScene />
        </div>
        {/* Content pulled up to overlap the sky backdrop. */}
        <div className="relative" style={{ zIndex: 1, marginTop: "-100vh" }}>
          {children}
          {/* Atmospheric haze transition: a fixed paper-fog veil (behind page
              content, above the fixed footer) that fades in then out across the
              seam, so the footer surfaces out of mist. Keyed by route so the
              scroll trigger geometry rebuilds fresh on navigation. */}
          <FogReveal key={path} />
        </div>
      </main>
      <Footer />
      <Breadcrumbs />
    </>
  );
}
