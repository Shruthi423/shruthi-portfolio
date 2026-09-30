// Live thumbnail for the OpenTabs card (ported from the standalone
// opentabs-motion-thumbnail.html prototype). At rest it's the closed door alone
// (the static CSS is the loop's first frame, so play starts without a jump);
// while `active` (hover, or on screen on touch) the door swings open, light
// blooms through it, and the wordmark slides out from behind it on a 7s loop.
// Pure CSS — every animated layer only touches transform or opacity, so the
// loop runs on the compositor. Reduced motion shows the finished, open state.
// All sizing lives in .opentabs-cover in globals.css.
export function OpenTabsThumbnail({ active }: { active: boolean }) {
  return (
    <div className={`opentabs-cover${active ? " is-playing" : ""}`}>
      <div className="opentabs-cover__stage">
        <div className="opentabs-cover__logo" role="img" aria-label="OpenTabs logo, an open door">
          <div className="opentabs-cover__glow" />
          <div className="opentabs-cover__doorway" />
          <div className="opentabs-cover__door">
            <div className="opentabs-cover__knob" />
          </div>
          <div className="opentabs-cover__frame" />
          <div className="opentabs-cover__floor" />
        </div>
        <div className="opentabs-cover__mask">
          <p className="opentabs-cover__word">
            Open
            <span className="opentabs-cover__tabs">
              Tabs
              <span className="opentabs-cover__tabs-lit" aria-hidden="true">
                Tabs
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
