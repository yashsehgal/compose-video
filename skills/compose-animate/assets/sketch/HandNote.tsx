import { Easing, useCurrentFrame, useVideoConfig } from "remotion";

import { HAND } from "../fonts";
import { INK } from "./ink";
import { progress } from "../motion";

/** How long a note takes to write, per character. */
const SECONDS_PER_CHAR = 0.045;

/** Seconds a note takes to write in, so a stroke can follow it. */
export const noteDuration = (text: string) =>
  Math.max(0.5, text.length * SECONDS_PER_CHAR);

/**
 * A note in marker hand that writes itself in left to right: a soft-edged
 * mask runs along the line at writing speed, so the ink appears where the
 * pen is, then fades when the beat is over.
 */
export const HandNote = ({
  text,
  x,
  y,
  align = "left",
  start,
  eraseAt,
  size = 36,
  rotate = -2.5,
}: {
  text: string;
  /** The anchor on the frame; `align` says which edge of the text it is. */
  x: number;
  y: number;
  align?: "left" | "center" | "right";
  start: number;
  eraseAt?: number;
  size?: number;
  /** Degrees. Notes lean a little, as written ones do. */
  rotate?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = noteDuration(text);
  const written = progress(
    frame,
    fps,
    start,
    duration,
    Easing.inOut(Easing.quad),
  );
  const erased =
    eraseAt === undefined ? 0 : progress(frame, fps, eraseAt, 0.35);
  if (written <= 0) return null;

  // The mask's edge travels from just before the text to just past it.
  const edge = -8 + written * 116;
  // Once the note is written there is no mask at all, so nothing trims it.
  const mask =
    written >= 1
      ? "none"
      : `linear-gradient(90deg, #000 ${edge - 8}%, transparent ${edge}%)`;
  const shift = align === "left" ? "0%" : align === "center" ? "-50%" : "-100%";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${shift}, -50%) rotate(${rotate}deg)`,
        transformOrigin: "left center",
        whiteSpace: "nowrap",
        // The hand's last strokes lean past the text box; keep them inside it.
        padding: "0.15em 0.3em",
        fontFamily: HAND,
        // The hand has one weight; anything else would be a faked bold.
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1,
        color: INK,
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity: 1 - erased,
      }}
    >
      {text}
    </div>
  );
};
