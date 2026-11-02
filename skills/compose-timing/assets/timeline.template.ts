/**
 * Every beat of the video, in seconds. One place to retime the whole thing:
 * the picture, the notes and the sounds all read these numbers, so moving
 * a beat here moves its motion, its note and its sound together.
 *
 * Each step runs the same way: the change lands, its note starts ~1.2s
 * later, the note is held ≥3s once written, and it is erased ~1s before
 * the next change starts.
 */
export const FPS = 60;
export const DURATION_S = 40;

/** How long a part takes to leave: long and eased at both ends. */
export const EXIT = 0.75;
/** How long a part takes to arrive, or to swap with another in place. */
export const SWAP = 0.6;

export const T = {
  intro: { start: 0.3, duration: 0.9 },

  // 1. <first design change>
  stepOne: { change: 3.0, changeDuration: 1.2, note: 4.4, erase: 9.4 },

  // 2. <second design change>
  stepTwo: { change: 10.4, changeDuration: 1.1, note: 11.8, erase: 17.4 },

  // ...one block per step, 7–8s apart.

  // The close: old above new, both in the same state.
  compare: { glide: 30.0, glideDuration: 1.3, before: 30.8, beforeCard: 31.05, after: 31.5 },
} as const;
