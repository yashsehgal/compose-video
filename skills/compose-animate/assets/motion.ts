import { Easing, interpolate } from "remotion";

/** The product's soft-blur-in curve (`SOFT_BLUR_IN_EASE`). */
export const SOFT = Easing.bezier(0.22, 1, 0.36, 1);
/** A gentle in-out, for things that leave. */
export const IN_OUT = Easing.bezier(0.645, 0.045, 0.355, 1);

/**
 * 0 → 1 over `[start, start + duration]` seconds, clamped, eased. Everything
 * on screen is a pure function of the frame, so every render of a frame is
 * identical and nothing can stutter.
 */
export const progress = (
  frame: number,
  fps: number,
  start: number,
  duration: number,
  easing: (t: number) => number = SOFT,
) =>
  interpolate(frame, [start * fps, (start + duration) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/**
 * How far an eased change has to get before the eye registers it, by kind.
 * Measured on the rendered frames, not guessed:
 * - a slide of dark, sharp edges shows at about half a pixel of travel;
 * - a fade shows once pixels have moved about 12 levels, ~8% of the way;
 * - the pill's light grey edge on white shows in between;
 * - the logos' lift and the stage's entrance land on the default.
 */
export const VISIBLE = {
  slide: 0.004,
  fade: 0.08,
  pill: 0.015,
  default: 0.03,
} as const;

/**
 * The second an eased change becomes visible: an eased curve barely moves
 * for its first frames, so its nominal start is earlier than anything a
 * viewer sees. Sounds start here, not at the nominal start.
 */
export const visibleAt = (
  start: number,
  duration: number,
  easing: (t: number) => number = SOFT,
  threshold: number = VISIBLE.default,
) => {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if (easing(mid) < threshold) low = mid;
    else high = mid;
  }
  return start + high * duration;
};
