// Synthesises this video's sound effects into public/sfx-<video>.
// Copy to scripts/make-<video>-sounds.mjs, set VIDEO, SCALE and the moves.
//
//   node scripts/make-<video>-sounds.mjs
//
// Imports the video's own timeline and curves, so each movement sound is
// shaped by the motion it plays under. Needs a Node that runs .ts imports
// directly (23.6+, or 22.6+ with --experimental-strip-types).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { IN_OUT, SOFT } from "../src/compose/motion.ts";
import { T } from "../src/<video>/timeline.ts";
import { chime, movement, plip, tap, thock, writeSounds } from "./sfx.mjs";

const VIDEO = "<video>";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", `sfx-${VIDEO}`);

/** The component's draw scale at 1080p; distances below are 1x px. */
const SCALE = 2.4;
/** The biggest move in this video, in 1x px. Every move is sized against it. */
const LARGEST_MOVE = 70;

const move = (name, { duration, easing = IN_OUT, travel, contrast, seed }) => [
  name,
  movement({
    duration,
    easing,
    travelPx: travel * SCALE,
    largestPx: LARGEST_MOVE * SCALE,
    contrast,
    seed,
  }),
];

const SOUNDS = Object.fromEntries([
  move("move-intro", { duration: T.intro.duration, easing: SOFT, travel: 25, seed: 101 }),
  // One entry per movement in the timeline, e.g.:
  // move("move-collapse", { duration: T.stepTwo.changeDuration, travel: 28, contrast: 0.6, seed: 102 }),

  // Ticks for text changing in place, rising through a sequence of stages.
  ["tick-1", tap(1180, 111)],
  ["tick-2", tap(1260, 112)],
  ["tick-3", tap(1340, 113)],
  ["tick-4", tap(1420, 114)],
  ["tick-5", tap(1500, 115)],
  ["tick-low", tap(560, 116)],
  ["plip-out", plip(1250, 720, 121)],
  ["plip-in", plip(720, 1250, 122)],
  ["thock", thock(170, 131)],
  ["chime", chime([784, 1175], 141)],
]);

writeSounds(OUT, SOUNDS);
