import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  // The stray ~/package-lock.json makes Next's lockfile-based root inference
  // pick the home directory as the workspace root. That mis-scopes Next's
  // file-tracing AND Turbopack's file-watcher — producing intermittent ENOENT
  // errors on dev manifests. Pin both explicitly to this project's directory.
  outputFileTracingRoot: projectRoot, // used by Webpack + production
  turbopack: {
    root: projectRoot, // used by Turbopack dev
  },
  // The Playground page was renamed to "The Lab" and moved to /the-lab.
  // 308-redirect the old URL so existing links / bookmarks don't 404.
  async redirects() {
    return [
      { source: "/playground", destination: "/the-lab", permanent: true },
    ];
  },
};

export default nextConfig;
