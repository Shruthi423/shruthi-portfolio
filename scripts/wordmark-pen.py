"""Derive a pen centreline per glyph from the real Homemade Apple outlines.

Rasterise each glyph, thin it to a one-pixel skeleton (Zhang-Suen), prune the
spurs the thinning leaves at stroke ends, then walk the skeleton as a single
continuous polyline per connected component. Output is font units with y down
and the baseline at y=0, i.e. the coordinate space Splash's <text> already uses.
"""
import json, math, sys
from collections import defaultdict
import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

WOFF2 = ".next/static/media/691f7cbfe73110bf-s.p.0bmjxzzn7mump.woff2"
TTF = "/private/tmp/claude-501/-Users-shruthia-Desktop-shruthi-portfolio/e7f2c13a-66b9-49de-9771-c3d789717740/scratchpad/HomemadeApple.ttf"
WORD = "Shruthi Aragonda"
PX = 400.0          # render size in px; skeleton resolution
PAD = 120           # px of slack around the glyph box

f = TTFont(WOFF2)
f.flavor = None
f.save(TTF)
UPM = f["head"].unitsPerEm
hmtx = f["hmtx"]
cmap = f.getBestCmap()
SCALE = UPM / PX     # px -> font units

pil = ImageFont.truetype(TTF, int(PX))

def raster(ch):
    """Filled glyph bitmap plus the px offset of the baseline-left origin."""
    img = Image.new("L", (int(PX * 3), int(PX * 3)), 0)
    d = ImageDraw.Draw(img)
    ox, oy = PX, PX * 2
    d.text((ox, oy), ch, font=pil, fill=255, anchor="ls")
    a = np.array(img) > 96
    ys, xs = np.nonzero(a)
    if len(xs) == 0:
        return None
    x0, x1 = xs.min() - 2, xs.max() + 3
    y0, y1 = ys.min() - 2, ys.max() + 3
    return a[y0:y1, x0:x1], (x0 - ox, y0 - oy)

def neighbours(a):
    p = np.pad(a, 1)
    return [p[0:-2,1:-1], p[0:-2,2:], p[1:-1,2:], p[2:,2:],
            p[2:,1:-1], p[2:,0:-2], p[1:-1,0:-2], p[0:-2,0:-2]]  # P2..P9

def thin(a):
    """Zhang-Suen, vectorised."""
    img = a.copy()
    while True:
        changed = False
        for step in (0, 1):
            n = neighbours(img)
            B = sum(x.astype(np.int8) for x in n)
            seq = n + [n[0]]
            A = sum(((~seq[i]) & seq[i+1]).astype(np.int8) for i in range(8))
            P2, P3, P4, P5, P6, P7, P8, P9 = n
            cond = img & (B >= 2) & (B <= 6) & (A == 1)
            if step == 0:
                cond &= (P2 & P4 & P6) == False
                cond &= (P4 & P6 & P8) == False
            else:
                cond &= (P2 & P4 & P8) == False
                cond &= (P2 & P6 & P8) == False
            if cond.any():
                img &= ~cond
                changed = True
        if not changed:
            return img

def thickness(a):
    """Rough max stroke half-width, via an iterative erosion count."""
    img, k = a.copy(), 0
    while img.any():
        n = neighbours(img)
        img = img & n[0] & n[2] & n[4] & n[6]
        k += 1
        if k > 200:
            break
    return k

OFF = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]

def components(sk):
    pts = {(int(y), int(x)) for y, x in zip(*np.nonzero(sk))}
    adj = {p: [q for q in ((p[0]+dy, p[1]+dx) for dy, dx in OFF) if q in pts] for p in pts}
    # Drop the diagonal shortcut across an L of three pixels. Left in, every
    # such triangle is a third edge the walk has to cover, and covering it
    # chops one long run into two.
    for a in pts:
        for b in list(adj[a]):
            if a[0] != b[0] and a[1] != b[1] and (
                (a[0], b[1]) in pts or (b[0], a[1]) in pts
            ):
                adj[a].remove(b)
    seen, out = set(), []
    for p in pts:
        if p in seen:
            continue
        stack, comp = [p], []
        seen.add(p)
        while stack:
            c = stack.pop()
            comp.append(c)
            for q in adj[c]:
                if q not in seen:
                    seen.add(q); stack.append(q)
        out.append((comp, adj))
    return out

def prune(comp, adj, limit):
    """Drop the short spurs thinning grows at stroke ends and junctions."""
    alive = set(comp)
    for _ in range(limit):
        deg = {p: sum(1 for q in adj[p] if q in alive) for p in alive}
        ends = [p for p in alive if deg[p] == 1]
        drop = set()
        for e in ends:
            run, cur, prev = [e], e, None
            while True:
                nxt = [q for q in adj[cur] if q in alive and q != prev and q not in run]
                if len(nxt) != 1:
                    break
                nd = sum(1 for q in adj[nxt[0]] if q in alive)
                if nd > 2:
                    break
                prev, cur = cur, nxt[0]
                run.append(cur)
                if len(run) > limit:
                    break
            if len(run) <= limit and any(sum(1 for q in adj[r] if q in alive) > 2 for r in run[-1:] + [c for c in adj[run[-1]] if c in alive]):
                drop |= set(run)
        if not drop:
            break
        alive -= drop
    return alive

def walk(alive, adj):
    """One continuous polyline covering every skeleton edge of a component."""
    nodes = sorted(alive)
    deg = {p: sum(1 for q in adj[p] if q in alive) for p in alive}
    ends = [p for p in alive if deg[p] == 1]
    # Handwriting enters from the left, so start at the leftmost pen-up point.
    start = min(ends, key=lambda p: (p[1], p[0])) if ends else min(nodes, key=lambda p: (p[1], p[0]))
    used, path, stack = set(), [start], [start]
    cur = start
    while True:
        nxt = None
        for q in sorted(adj[cur], key=lambda q: (q[1], q[0])):
            if q in alive and frozenset((cur, q)) not in used:
                nxt = q; break
        if nxt is not None:
            used.add(frozenset((cur, nxt)))
            path.append(nxt); stack.append(nxt); cur = nxt
            continue
        # Nothing new here: retrace back along the path looking for unused ink.
        back = None
        for i in range(len(stack) - 2, -1, -1):
            p = stack[i]
            if any(q in alive and frozenset((p, q)) not in used for q in adj[p]):
                back = i; break
        if back is None:
            return path
        path.extend(reversed(stack[back:-1]))
        stack = stack[:back + 1]
        cur = stack[-1]

def runs(path):
    """Split a walk into the runs where it lays ink down for the first time.

    The walk has to double back through a letter to reach every limb, but the
    reveal is cumulative: retraced ground adds no ink and would only stall the
    nib. Each first-time run becomes its own stroke instead, so the write plays
    in the walk's order at a steady rate.
    """
    out, cur, done = [], [path[0]], set()
    for a, b in zip(path, path[1:]):
        e = frozenset((a, b))
        if e in done:
            if len(cur) > 1:
                out.append(cur)
            cur = [b]
        else:
            done.add(e)
            if cur[-1] != a:
                cur = [a]
            cur.append(b)
    if len(cur) > 1:
        out.append(cur)
    return out


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0], float), np.array(pts[-1], float)
    ab = b - a
    n = np.hypot(*ab)
    if n < 1e-9:
        d = [np.hypot(*(np.array(p, float) - a)) for p in pts]
    else:
        d = [abs(np.cross(ab, np.array(p, float) - a)) / n for p in pts]
    i = int(np.argmax(d))
    if d[i] <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:i+1], eps)[:-1] + rdp(pts[i:], eps)

def length(pts):
    return sum(math.dist(pts[i], pts[i+1]) for i in range(len(pts) - 1))

def fmt(pts):
    d = f"M{pts[0][0]:.0f} {pts[0][1]:.0f}"
    for x, y in pts[1:]:
        d += f"L{x:.0f} {y:.0f}"
    return d

strokes, pen, advance, thick = [], 0.0, 0.0, []
sys.setrecursionlimit(10000)
for ch in WORD:
    gname = cmap.get(ord(ch))
    adv = hmtx[gname][0] if gname else int(UPM * 0.25)
    if ch == " " or gname is None:
        advance += adv
        continue
    r = raster(ch)
    if r is None:
        advance += adv
        continue
    bmp, (offx, offy) = r
    thick.append(thickness(bmp) * SCALE)
    sk = thin(bmp)
    limit = max(6, int(0.10 * max(bmp.shape)))
    glyph = []
    for comp, adj in components(sk):
        alive = prune(comp, adj, limit)
        if len(alive) < 4:
            continue
        for run in runs(walk(alive, adj)):
            # px (row, col) -> font units, y down, baseline at 0, glyph advanced.
            fu = [((c + offx) * SCALE + advance, (rr + offy) * SCALE) for rr, c in run]
            fu = rdp(fu, 5.0)
            if length(fu) < 25:
                continue
            glyph.append((len(alive), fu))
    # The body of the letter first, then its dot or crossbar, left to right —
    # the order a hand makes them.
    big = max(g[0] for g in glyph) if glyph else 0
    body = [g for g in glyph if g[0] == big]
    extras = sorted((g for g in glyph if g[0] != big), key=lambda g: g[1][0][0])
    for _, fu in body + extras:
        L = length(fu)
        strokes.append({"len": round(L), "d": fmt(fu)})
        pen += L
    advance += adv

print(json.dumps({
    "strokes": strokes,
    "total": round(pen),
    "advance": round(advance),
    "thickness": round(max(thick) * 2),
    "count": len(strokes),
    "bytes": sum(len(s["d"]) for s in strokes),
}))
