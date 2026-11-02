import { random } from "remotion";

type Point = { x: number; y: number };

/**
 * Catmull-Rom through the points, as cubic Béziers: a pen line that passes
 * through every sample without corners.
 */
const smoothPath = (points: Point[]) => {
  const [first] = points;
  if (!first) return "";
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(
      1,
    )} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

/** A little seeded unsteadiness, the same on every render. */
const wobble = (seed: string, index: number, amount: number) =>
  (random(`${seed}-${index}`) - 0.5) * 2 * amount;

/**
 * A loose ring drawn in one go: it starts top-left, goes all the way round,
 * and overshoots its start a little on a slightly wider pass, the way a
 * quick circle around something is drawn by hand.
 */
export const looseOval = ({
  cx,
  cy,
  rx,
  ry,
  seed,
  tilt = -0.08,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  seed: string;
  tilt?: number;
}) => {
  const samples = 40;
  const start = -Math.PI * 0.62;
  const sweep = Math.PI * 2 + 0.55;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const angle = start + sweep * t;
    // Spirals out a touch so the overshoot does not sit on the first pass.
    const grow = 1 + t * 0.08 + wobble(seed, i, 0.018);
    const x = Math.cos(angle) * rx * grow;
    const y = Math.sin(angle) * ry * grow;
    points.push({
      x: cx + x * Math.cos(tilt) - y * Math.sin(tilt),
      y: cy + x * Math.sin(tilt) + y * Math.cos(tilt),
    });
  }
  return smoothPath(points);
};

/**
 * A pen line from one point to another, bowed by `bend` px to one side, with
 * a faint tremor. Returns the angle it arrives at, for an arrowhead.
 */
export const penLine = ({
  from,
  to,
  bend,
  seed,
}: {
  from: Point;
  to: Point;
  bend: number;
  seed: string;
}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / length, y: dx / length };
  const control = {
    x: from.x + dx / 2 + normal.x * bend,
    y: from.y + dy / 2 + normal.y * bend,
  };
  const samples = 10;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const u = 1 - t;
    // Steadier at the ends, where a hand starts and lands deliberately.
    const tremor = i === 0 || i === samples ? 0 : wobble(seed, i, 1.1);
    points.push({
      x: u * u * from.x + 2 * u * t * control.x + t * t * to.x + normal.x * tremor,
      y: u * u * from.y + 2 * u * t * control.y + t * t * to.y + normal.y * tremor,
    });
  }
  const angle = Math.atan2(to.y - control.y, to.x - control.x);
  return { d: smoothPath(points), angle };
};

/** Two quick flicks back from the tip. */
export const arrowHead = ({
  tip,
  angle,
  size = 16,
}: {
  tip: Point;
  angle: number;
  size?: number;
}) => {
  const left = angle + Math.PI - 0.5;
  const right = angle + Math.PI + 0.42;
  const a = {
    x: tip.x + Math.cos(left) * size,
    y: tip.y + Math.sin(left) * size,
  };
  const b = {
    x: tip.x + Math.cos(right) * size * 0.9,
    y: tip.y + Math.sin(right) * size * 0.9,
  };
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${tip.x.toFixed(
    1,
  )} ${tip.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
};

/** A hand-drawn square bracket under a span, its corners softened. */
export const bracket = ({
  x1,
  x2,
  y,
  depth,
  seed,
}: {
  x1: number;
  x2: number;
  y: number;
  depth: number;
  seed: string;
}) =>
  smoothPath([
    { x: x1 + wobble(seed, 0, 1), y: y - depth },
    { x: x1 + 0.5, y: y - depth * 0.35 },
    { x: x1 + 3, y: y + wobble(seed, 1, 0.8) },
    { x: (x1 + x2) / 2, y: y + 1 + wobble(seed, 2, 1) },
    { x: x2 - 3, y: y + wobble(seed, 3, 0.8) },
    { x: x2 - 0.5, y: y - depth * 0.35 },
    { x: x2 + wobble(seed, 4, 1), y: y - depth },
  ]);
