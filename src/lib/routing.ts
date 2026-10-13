// Orthogonal connector routing that goes around steps.
//
// Builds a sparse grid from the edges of every (padded) step plus the mid-points of the gaps between them,
// then runs A* over it. Costs favor short routes with few turns, and avoid running along lines that
// earlier connectors already use, so parallel connectors fan out instead of stacking.

export type Pt = [number, number];
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Dir = 0 | 1 | 2 | 3; // right, down, left, up
export const DIRS: Pt[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export interface Used {
  h: Map<number, [number, number][]>; // horizontal runs by y
  v: Map<number, [number, number][]>; // vertical runs by x
}
export const newUsed = (): Used => ({ h: new Map(), v: new Map() });

const key = (n: number) => Math.round(n);
const r2 = (n: number) => Math.round(n * 100) / 100;

function overlap(list: [number, number][] | undefined, a: number, b: number) {
  if (!list) return 0;
  let total = 0;
  for (const [s, e] of list) total += Math.max(0, Math.min(b, e) - Math.max(a, s));
  return total;
}

export function markUsed(used: Used, pts: Pt[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    if (ay === by) {
      const list = used.h.get(key(ay)) ?? [];
      list.push([Math.min(ax, bx), Math.max(ax, bx)]);
      used.h.set(key(ay), list);
    } else if (ax === bx) {
      const list = used.v.get(key(ax)) ?? [];
      list.push([Math.min(ay, by), Math.max(ay, by)]);
      used.v.set(key(ax), list);
    }
  }
}

// Removes points that sit in the middle of a straight run.
export function simplify(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    if (out.length >= 2) {
      const a = out[out.length - 2];
      if ((a[0] === last[0] && last[0] === p[0]) || (a[1] === last[1] && last[1] === p[1])) {
        out[out.length - 1] = p;
        continue;
      }
    }
    out.push(p);
  }
  return out;
}

const TURN = 30;

// Smallest-first queue keyed by cost.
class Heap {
  private f: number[] = [];
  private s: number[] = [];
  get size() {
    return this.f.length;
  }
  push(f: number, s: number) {
    let i = this.f.length;
    this.f.push(f);
    this.s.push(s);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.f[p] <= this.f[i]) break;
      [this.f[p], this.f[i]] = [this.f[i], this.f[p]];
      [this.s[p], this.s[i]] = [this.s[i], this.s[p]];
      i = p;
    }
  }
  pop(): number {
    const top = this.s[0];
    const lf = this.f.pop()!;
    const ls = this.s.pop()!;
    if (this.f.length) {
      this.f[0] = lf;
      this.s[0] = ls;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < this.f.length && this.f[l] < this.f[m]) m = l;
        if (r < this.f.length && this.f[r] < this.f[m]) m = r;
        if (m === i) break;
        [this.f[m], this.f[i]] = [this.f[i], this.f[m]];
        [this.s[m], this.s[i]] = [this.s[i], this.s[m]];
        i = m;
      }
    }
    return top;
  }
}

function search(start: Pt, startDir: Dir | null, end: Pt, obstacles: Rect[], used: Used, margin: number): Pt[] | null {
  const boxes = obstacles.map((r) => ({ x1: r.x - margin, y1: r.y - margin, x2: r.x + r.w + margin, y2: r.y + r.h + margin }));

  const axis = (vals: number[]) => {
    const u = [...new Set(vals.map(r2))].sort((a, b) => a - b);
    const out = new Set(u);
    for (let i = 0; i < u.length - 1; i++) if (u[i + 1] - u[i] > 36) out.add(r2((u[i] + u[i + 1]) / 2));
    return [...out].sort((a, b) => a - b);
  };
  const xRaw = [start[0], end[0]];
  const yRaw = [start[1], end[1]];
  for (const b of boxes) {
    xRaw.push(b.x1, b.x2);
    yRaw.push(b.y1, b.y2);
  }
  xRaw.push(Math.min(...xRaw) - 40, Math.max(...xRaw) + 40);
  yRaw.push(Math.min(...yRaw) - 40, Math.max(...yRaw) + 40);
  const xs = axis(xRaw);
  const ys = axis(yRaw);
  const nx = xs.length;
  const ny = ys.length;
  const xi = new Map(xs.map((v, i) => [v, i]));
  const yi = new Map(ys.map((v, i) => [v, i]));
  const edgeX = new Set(boxes.flatMap((b) => [r2(b.x1), r2(b.x2)]));
  const edgeY = new Set(boxes.flatMap((b) => [r2(b.y1), r2(b.y2)]));

  // Which grid segments cut through a padded step?
  const blockH = new Uint8Array(Math.max(0, nx - 1) * ny); // (i,j) -> (i+1,j)
  const blockV = new Uint8Array(nx * Math.max(0, ny - 1)); // (i,j) -> (i,j+1)
  for (const b of boxes) {
    for (let j = 0; j < ny; j++) {
      if (!(ys[j] > b.y1 && ys[j] < b.y2)) continue;
      for (let i = 0; i < nx - 1; i++) if (xs[i] >= b.x1 && xs[i + 1] <= b.x2) blockH[j * (nx - 1) + i] = 1;
    }
    for (let i = 0; i < nx; i++) {
      if (!(xs[i] > b.x1 && xs[i] < b.x2)) continue;
      for (let j = 0; j < ny - 1; j++) if (ys[j] >= b.y1 && ys[j + 1] <= b.y2) blockV[j * nx + i] = 1;
    }
  }

  const si = xi.get(r2(start[0]));
  const sj = yi.get(r2(start[1]));
  const ei = xi.get(r2(end[0]));
  const ej = yi.get(r2(end[1]));
  if (si === undefined || sj === undefined || ei === undefined || ej === undefined) return null;

  const total = nx * ny * 4;
  const dist = new Float64Array(total).fill(Infinity);
  const parent = new Int32Array(total).fill(-1);
  const heap = new Heap();
  const h = (i: number, j: number) => Math.abs(xs[i] - xs[ei]) + Math.abs(ys[j] - ys[ej]);
  const starts: Dir[] = startDir === null ? [0, 1, 2, 3] : [startDir];
  for (const d of starts) {
    const s = (sj * nx + si) * 4 + d;
    dist[s] = 0;
    heap.push(h(si, sj), s);
  }

  let goal = -1;
  while (heap.size) {
    const s = heap.pop();
    const d = (s & 3) as Dir;
    const id = s >> 2;
    const i = id % nx;
    const j = (id - i) / nx;
    if (i === ei && j === ej) {
      goal = s;
      break;
    }
    const base = dist[s];
    for (let nd = 0 as Dir; nd < 4; nd = (nd + 1) as Dir) {
      if (nd === ((d + 2) & 3)) continue; // no U-turns
      const ni = i + DIRS[nd][0];
      const nj = j + DIRS[nd][1];
      if (ni < 0 || nj < 0 || ni >= nx || nj >= ny) continue;
      const horizontal = nd === 0 || nd === 2;
      const lo = horizontal ? Math.min(i, ni) : Math.min(j, nj);
      if (horizontal ? blockH[j * (nx - 1) + lo] : blockV[lo * nx + i]) continue;

      const a = horizontal ? xs[Math.min(i, ni)] : ys[Math.min(j, nj)];
      const b = horizontal ? xs[Math.max(i, ni)] : ys[Math.max(j, nj)];
      const len = b - a;
      const fixed = horizontal ? ys[j] : xs[i];
      const crowded = overlap((horizontal ? used.h : used.v).get(key(fixed)), a, b) * 1.5;
      const hugging = (horizontal ? edgeY : edgeX).has(fixed) ? len * 0.15 : 0;
      const cost = base + len + hugging + crowded + (nd !== d ? TURN : 0);

      const ns = (nj * nx + ni) * 4 + nd;
      if (cost < dist[ns]) {
        dist[ns] = cost;
        parent[ns] = s;
        heap.push(cost + h(ni, nj), ns);
      }
    }
  }
  if (goal < 0) return null;

  const pts: Pt[] = [];
  for (let s = goal; s !== -1; s = parent[s]) {
    const id = s >> 2;
    const i = id % nx;
    pts.push([xs[i], ys[(id - i) / nx]]);
  }
  return simplify(pts.reverse());
}

// A route from `start` to `end` that avoids `obstacles`. Tries a normal padding first, then a tighter one,
// and finally a plain elbow so there is always a line to draw.
export function route(start: Pt, startDir: Dir | null, end: Pt, obstacles: Rect[], used: Used): Pt[] {
  for (const margin of [10, 4]) {
    const found = search(start, startDir, end, obstacles, used, margin);
    if (found && found.length >= 2) return found;
  }
  const horizontalFirst = startDir === 0 || startDir === 2;
  return simplify(horizontalFirst ? [start, [end[0], start[1]], end] : [start, [start[0], end[1]], end]);
}
