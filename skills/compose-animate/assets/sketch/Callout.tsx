import { HandNote, noteDuration } from "./HandNote";
import { SketchStroke } from "./SketchStroke";
import { arrowHead, penLine } from "./shapes";

type Point = { x: number; y: number };

/**
 * A note and the line it draws to what it means: the note writes in, then
 * the pen runs from it to the target and flicks an arrowhead, the order a
 * person marks up a screenshot in.
 */
export const Callout = ({
  text,
  anchor,
  align = "left",
  from,
  to,
  bend,
  start,
  eraseAt,
  seed,
}: {
  text: string;
  /** Where the note sits. */
  anchor: Point;
  align?: "left" | "center" | "right";
  /** Where the line leaves the note. */
  from: Point;
  /** What it points at. */
  to: Point;
  bend: number;
  start: number;
  eraseAt?: number;
  seed: string;
}) => {
  const line = penLine({ from, to, bend, seed });
  const lineAt = start + noteDuration(text) - 0.05;
  const lineDuration = 0.45;

  return (
    <>
      <HandNote
        text={text}
        x={anchor.x}
        y={anchor.y}
        align={align}
        start={start}
        eraseAt={eraseAt}
      />
      <SketchStroke
        d={line.d}
        start={lineAt}
        duration={lineDuration}
        eraseAt={eraseAt}
      />
      <SketchStroke
        d={arrowHead({ tip: to, angle: line.angle })}
        start={lineAt + lineDuration - 0.04}
        duration={0.16}
        eraseAt={eraseAt}
      />
    </>
  );
};
