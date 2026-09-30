"use client";

import { useEffect, useRef } from "react";

const LOOP = 6;
const SETTLED_T = 4; // fully drawn, before the fade-out that starts at 5.3

// Self-drawing kolam animation used as the live thumbnail for the 9and9 case
// study (ported from the standalone 9and9-thumbnail.html prototype). Idle it
// sits fully drawn; while `active` (hover, or on screen on touch) it replays
// the draw-in loop.
export function KolamThumbnail({ active }: { active: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const renderRef = useRef<(t: number) => void>(() => {});
  const rafRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const N = 720;
    const n = 8;
    const m = n + 1;
    const C = 90;
    const R0 = 48;
    const rho = 20;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const a = (2 * Math.PI * i) / N;
      pts.push([
        C + R0 * Math.cos(a) + rho * Math.cos(m * a + Math.PI),
        C + R0 * Math.sin(a) + rho * Math.sin(m * a + Math.PI),
      ]);
    }

    const per = N / n;
    const dots: [number, number][] = [[C, C]];
    for (let k = 0; k < n; k++) {
      let x = 0;
      let y = 0;
      for (let s = 0; s < per; s++) {
        const q = pts[(k * per + s) % N];
        x += q[0];
        y += q[1];
      }
      x /= per;
      y /= per;
      const a = Math.atan2(y - C, x - C);
      const r = Math.hypot(x - C, y - C);
      dots.push([C + (r + rho * 0.35) * Math.cos(a), C + (r + rho * 0.35) * Math.sin(a)]);
      const a2 = a + Math.PI / n;
      dots.push([C + (R0 - rho * 0.6) * Math.cos(a2), C + (R0 - rho * 0.6) * Math.sin(a2)]);
    }

    svg.innerHTML =
      dots
        .map(
          (q) =>
            `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2.4" fill="#EE7A1B" opacity="0"/>`,
        )
        .join("") +
      `<path d="M${pts.map((q) => q[0].toFixed(2) + " " + q[1].toFixed(2)).join(" L")}" fill="none" stroke="#F7C58B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle r="3.2" fill="#fff" opacity="0"/>`;

    const path = svg.querySelector("path") as SVGPathElement;
    const L = path.getTotalLength();
    const allCircles = [...svg.querySelectorAll("circle")];
    const tip = allCircles.pop() as SVGCircleElement;
    const cs = allCircles;
    path.style.strokeDasharray = String(L);

    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const cl = (x: number) => Math.max(0, Math.min(1, x));

    function render(t: number) {
      const out = 1 - cl((t - 5.3) / 0.5);
      cs.forEach((c, i) => c.setAttribute("opacity", String(cl((t - 0.1 - (i * 0.9) / cs.length) / 0.2) * out)));
      const p = ease(cl((t - 0.7) / 3.9));
      path.style.strokeDashoffset = String(L * (1 - p));
      path.style.opacity = String(out);
      const q = path.getPointAtLength(L * p);
      tip.setAttribute("cx", String(q.x));
      tip.setAttribute("cy", String(q.y));
      tip.setAttribute("opacity", p > 0 && p < 1 ? "1" : "0");
    }
    renderRef.current = render;

    render(SETTLED_T);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t0 = performance.now();
    const f = (now: number) => {
      renderRef.current(((now - t0) / 1000) % LOOP);
      rafRef.current = requestAnimationFrame(f);
    };
    rafRef.current = requestAnimationFrame(f);

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderRef.current(SETTLED_T);
    };
  }, [active]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(140% 110% at 82% 12%, rgba(214,96,32,.55), transparent 62%), radial-gradient(130% 110% at 8% 100%, rgba(120,20,40,.6), transparent 60%), linear-gradient(135deg, #3B0F14 0%, #5C1B16 100%)",
      }}
    >
      <svg
        ref={svgRef}
        viewBox="14 14 152 152"
        role="img"
        aria-label="A kolam drawing itself"
        className="block h-[65%] w-[65%]"
      />
    </div>
  );
}
