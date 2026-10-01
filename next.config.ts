import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import path from "node:path";

const projectRoot = path.join(__dirname);

// "Last updated" in the footer. Read from the last commit at build time so it
// is true without anyone remembering to bump a constant. Vercel clones the
// repo, so `git log` works there; if it ever doesn't, fall back to build day.
const lastUpdated = (() => {
  let iso: string;
  try {
    iso = execSync("git log -1 --format=%cI", { cwd: projectRoot }).toString().trim();
  } catch {
    iso = new Date().toISOString();
  }
  // Formatted here, not in the component: a fixed string can't drift between
  // the server render and the client's locale/timezone.
  const [{ value: month }, , { value: day }, , { value: year }] =
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).formatToParts(new Date(iso));
  return `${month} ${day} ${year}`;
})();

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_LAST_UPDATED: lastUpdated },
  // The stray ~/package-lock.json makes Next's lockfile-based root inference
  // pick the home directory as the workspace root. That mis-scopes Next's
  // file-tracing AND Turbopack's file-watcher — producing intermittent ENOENT
  // errors on dev manifests. Pin both explicitly to this project's directory.
  outputFileTracingRoot: projectRoot, // used by Webpack + production
  turbopack: {
    root: projectRoot, // used by Turbopack dev
  },
  // "The Lab" was renamed back to "Playground" and moved to /playground.
  // 308-redirect the old /the-lab URL so existing links / bookmarks don't 404.
  async redirects() {
    return [
      { source: "/the-lab", destination: "/playground", permanent: true },
    ];
  },
};

export default nextConfig;
