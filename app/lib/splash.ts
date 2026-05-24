// Coordinates the global splash (rendered in the layout) with the home page so
// the home content reveals in sync with the splash lifting. Module state is
// fresh on every hard load - which is exactly when the splash should play.

// The landing path of THIS full page load. Used to tell a fresh home refresh
// (splash plays) apart from a client-side navigation into home (no splash).
const landedOnHome =
  typeof window !== "undefined" && window.location.pathname === "/";

let lifted = false;
const listeners = new Set<() => void>();

/** True when a splash is expected for this load (a fresh home landing). */
export function splashWillPlay(): boolean {
  return landedOnHome;
}

/** Has the splash already lifted (or been skipped)? */
export function isSplashLifted(): boolean {
  return lifted;
}

/** Called by the splash the instant it begins lifting. */
export function liftSplash(): void {
  if (lifted) return;
  lifted = true;
  listeners.forEach((l) => l());
}

/** Subscribe to the lift; returns an unsubscribe fn. */
export function onSplashLift(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
