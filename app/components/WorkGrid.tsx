"use client";

import { useMemo, useState } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

/**
 * Client-side filter + sort layer for the /work grid. Renders a small row of
 * year chips above the cards (plus a "coming soon" chip for in-progress work),
 * and always sorts the visible cards newest-first.
 *
 * Kept separate from app/work/page.tsx so the page itself stays a server
 * component and the project array doesn't have to ship as a client bundle from
 * any deeper than this.
 */

const ALL = "all";
const COMING = "coming soon";

// "2023–2024" → 2024, "2024" → 2024. Pulls the highest 4-digit year mentioned.
function yearKey(y: string): number {
  const matches = y.match(/\d{4}/g);
  return matches ? Math.max(...matches.map(Number)) : 0;
}

export function WorkGrid({ projects }: { projects: Project[] }) {
  // Filter chips = "all" + each unique year (newest first) + "coming soon"
  // (only shown if there's actually upcoming work in the list).
  const years = useMemo(() => {
    const set = new Set<number>();
    projects.forEach((p) => set.add(yearKey(p.year)));
    return [...set].sort((a, b) => b - a).map(String);
  }, [projects]);
  const hasComing = useMemo(() => projects.some((p) => !p.href), [projects]);

  const chips = useMemo(
    () => [ALL, ...years, ...(hasComing ? [COMING] : [])],
    [years, hasComing],
  );

  const [active, setActive] = useState<string>(ALL);

  const visible = useMemo(() => {
    const filtered = projects.filter((p) => {
      if (active === ALL) return true;
      if (active === COMING) return !p.href;
      return yearKey(p.year) === Number(active);
    });
    // Newest-first regardless of filter. Array.sort is stable in modern engines,
    // so ties (same year) keep their original order in the source array.
    return [...filtered].sort((a, b) => yearKey(b.year) - yearKey(a.year));
  }, [projects, active]);

  return (
    <section className="px-10 pb-10">
      {/* filter chips */}
      <nav
        aria-label="Filter projects by year"
        className="mx-auto mb-12 flex max-w-4xl flex-wrap items-center justify-center gap-2"
      >
        {chips.map((chip) => {
          const isActive = chip === active;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActive(chip)}
              aria-pressed={isActive}
              data-cursor-label={isActive ? undefined : chip}
              className={
                isActive
                  ? "rounded-full bg-text px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-bg transition-colors"
                  : "rounded-full border border-border px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-text/55 transition-colors hover:border-text/40 hover:text-text"
              }
            >
              {chip}
            </button>
          );
        })}
      </nav>

      <div className="mx-auto grid grid-cols-1 gap-x-8 gap-y-16 md:w-4/5 md:grid-cols-2">
        {visible.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </section>
  );
}
