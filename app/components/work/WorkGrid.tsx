"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectCard, type Project } from "@/app/components/work/ProjectCard";
import { WorkList } from "@/app/components/work/WorkList";

/**
 * The work section. Sorts every project chronologically (Latest / Oldest) and
 * renders one of two views, toggled top-right and remembered across visits:
 *   • grid — the project cards
 *   • list — the giant-serif index (WorkList), whose spotlit project floods the
 *     whole section with its accent colour.
 *
 * Kept a client island so the page stays a server component and the project
 * array doesn't ship as a client bundle from any deeper than this.
 */

type SortKey = "latest" | "oldest";
type ViewKey = "grid" | "list";

const SORT_CHIPS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "oldest", label: "Oldest" },
];

// End year from a year string: "2025" → 2025, "2023-2024" → 2024. Undated → 0.
function endYear(year?: string): number {
  const found = year?.match(/\d{4}/g);
  return found ? Math.max(...found.map(Number)) : 0;
}

function ViewToggle({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-full transition-colors";
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Switch work layout">
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`${base} ${view === "list" ? "bg-text text-bg" : "text-text/55 hover:text-text"}`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`${base} ${view === "grid" ? "bg-text text-bg" : "text-text/55 hover:text-text"}`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      </button>
    </div>
  );
}

export function WorkGrid({
  projects,
  heading,
}: {
  projects: Project[];
  // Optional inline label rendered on the same row as the controls.
  heading?: string;
}) {
  const [sort, setSort] = useState<SortKey>("oldest");
  const [view, setView] = useState<ViewKey>("list");
  const [accent, setAccent] = useState<string | null>(null);

  // Restore the remembered view after mount (SSR renders the "list" default, so
  // there's no hydration mismatch).
  useEffect(() => {
    const v = localStorage.getItem("work-view");
    if (v === "grid" || v === "list") setView(v);
  }, []);

  const changeView = (v: ViewKey) => {
    setView(v);
    setAccent(null);
    try {
      localStorage.setItem("work-view", v);
    } catch {}
  };

  const onActive = useCallback((p: Project | null) => setAccent(p?.accent ?? null), []);

  const visible = useMemo(() => {
    const dir = sort === "latest" ? -1 : 1;
    // Stable sort keeps the source order within the same year.
    return [...projects].sort((a, b) => dir * (endYear(a.year) - endYear(b.year)));
  }, [projects, sort]);

  const listView = view === "list";

  return (
    <section
      className={
        listView ? "relative min-h-screen py-24" : "py-24"
      }
      style={
        listView
          ? { backgroundColor: accent ?? "var(--bg)", transition: "background-color 0.5s ease" }
          : undefined
      }
    >
      {/* heading + sort chips + view toggle, on one row */}
      <div
        className={`mx-auto mb-6 flex w-full flex-wrap items-center gap-x-5 gap-y-3 px-5 sm:px-8 ${
          heading ? "max-w-[1700px] justify-between" : "max-w-4xl justify-center"
        }`}
      >
        {heading && (
          <p className="font-mono text-caption-1 uppercase tracking-wide text-text">
            {heading}
          </p>
        )}
        <div className="flex items-center gap-4">
          <nav aria-label="Sort projects by date" className="flex flex-wrap items-center gap-2">
            {SORT_CHIPS.map((chip) => {
              const isActive = chip.key === sort;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSort(chip.key)}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "rounded-full bg-text px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-bg transition-colors"
                      : "rounded-full border border-border px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-text/55 transition-colors hover:border-text/40 hover:text-text"
                  }
                >
                  {chip.label}
                </button>
              );
            })}
          </nav>
          <ViewToggle view={view} onChange={changeView} />
        </div>
      </div>

      {listView ? (
        <WorkList projects={visible} onActive={onActive} />
      ) : (
        <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-x-6 gap-y-16 px-5 sm:px-8 md:grid-cols-2">
          {visible.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
