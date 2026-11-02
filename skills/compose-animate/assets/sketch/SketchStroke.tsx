import { evolvePath } from "@remotion/paths";
import { useCurrentFrame, useVideoConfig } from "remotion";

import { INK } from "./ink";
import { IN_OUT, progress } from "../motion";

/**
 * A pen stroke that draws itself from start to end, then fades when the
 * beat is over. Drawn on the whole frame's coordinates.
 */
export const SketchStroke = ({
  d,
  start,
  duration,
  eraseAt,
  width = 3.2,
}: {
  d: string;
  /** Seconds. */
  start: number;
  duration: number;
  eraseAt?: number;
  width?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, width: frameWidth, height } = useVideoConfig();
  // A hand speeds up through a stroke and slows to land it.
  const drawn = progress(frame, fps, start, duration, IN_OUT);
  const erased =
    eraseAt === undefined ? 0 : progress(frame, fps, eraseAt, 0.35);
  if (drawn <= 0) return null;
  const { strokeDasharray, strokeDashoffset } = evolvePath(drawn, d);

  return (
    <svg
      width={frameWidth}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 1 - erased }}
    >
      <path
        d={d}
        fill="none"
        stroke={INK}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};
