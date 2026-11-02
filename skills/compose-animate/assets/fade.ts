import type { CSSProperties } from "react";

/**
 * In and out the same soft way: opacity, a blur that clears as the part
 * arrives and gathers as it goes, and a hint of scale about `origin`, so a
 * part dissolves in place rather than blinking off.
 *
 * `shown` runs 0 → 1. Drive it with an ease-out curve for arrivals and an
 * ease-in-out curve for exits. `transform` is anything the part already
 * moves by; the scale is appended to it. Blur is in the part's own px, so
 * a part drawn at 2.4× blurs 2.4× as far on the frame.
 */
export const fade = (
  shown: number,
  { origin = "center", transform = "" }: { origin?: string; transform?: string } = {},
): CSSProperties => {
  const gone = 1 - Math.max(0, Math.min(1, shown));
  return {
    opacity: 1 - gone,
    filter: gone <= 0 ? "none" : `blur(${gone * 2.5}px)`,
    transform: `${transform} scale(${1 - gone * 0.03})`.trim(),
    transformOrigin: origin,
  };
};
