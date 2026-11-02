import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";

import { IN_OUT, SOFT, VISIBLE, visibleAt } from "../compose/motion";
import { EXIT, T } from "./timeline";

const VIDEO = "<video>";

type Cue = {
  /** Seconds. */
  at: number;
  /** A file name in public/sfx-<video>, without .wav. */
  sound: string;
  volume: number;
};

/** Every movement sound plays at one level; its size is baked into the file. */
const MOVEMENT_VOLUME = 0.32;

/** A fade's first visible frame: an eased fade is invisible at its start. */
const shows = (start: number, duration: number, easing = SOFT) =>
  visibleAt(start, duration, easing, VISIBLE.fade);
const leaves = (start: number) => shows(start, EXIT, IN_OUT);

/** One soft sound per change to the component, sized to the change. */
export const CUES: Cue[] = [
  { at: T.intro.start, sound: "move-intro", volume: MOVEMENT_VOLUME },
  // e.g. a part leaving, then the space closing behind it:
  // { at: leaves(T.stepTwo.change), sound: "plip-out", volume: 0.08 },
  // { at: T.stepTwo.change + 0.25, sound: "move-collapse", volume: MOVEMENT_VOLUME },
];

export const SoundCues = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CUES.map((cue, index) => (
        <Sequence
          key={`${cue.sound}-${index}`}
          from={Math.round(cue.at * fps)}
          durationInFrames={Math.round(1.5 * fps)}
          layout="none"
        >
          <Audio src={staticFile(`sfx-${VIDEO}/${cue.sound}.wav`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
