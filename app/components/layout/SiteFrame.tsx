"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/app/components/layout/Breadcrumbs";
import { SiteNav } from "@/app/components/layout/SiteNav";
import { SiteFooter } from "@/app/components/layout/SiteFooter";

/**
 * Route-aware shell. SiteNav (top) and SiteFooter (bottom) are shared by every
 * page so the nav + footer can never drift. The home renders SiteFooter itself
 * as the last section of its one-pager; every inner page gets it appended here
 * after the page content, so the footprint footer is identical everywhere.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  // The home (`/`) renders bare: HomeV2 owns its ScrollSmoother one-pager and
  // its own trailing <SiteFooter />. Inner pages get the footer appended below.
  const isBare = path === "/";

  // Clear any lingering body scroll-lock on every navigation (nothing locks it
  // anymore, but owning the reset here keeps a stray lock from ever leaking).
  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [path]);

  if (isBare)
    return (
      <>
        <SiteNav />
        {children}
      </>
    );

  return (
    <>
      <SiteNav />
      <main className="relative z-10 flex-1">{children}</main>
      <SiteFooter />
      <Breadcrumbs />
    </>
  );
}
