---
name: compose-timing
description: Pace and synchronise a Remotion component breakdown video, so every motion, hand-drawn note and sound effect lands on the right frame and stays readable. Use when setting up a video's timeline, retiming beats, making notes stay longer, fixing sounds that land early or late, or checking that audio matches the picture. Pairs with compose-animate and compose-sounds.
---

# Compose: timing

The picture, the notes and the sounds of a breakdown video run on one clock. If they each keep their own numbers, they drift apart on the first retime.

## One timeline, in seconds

- Copy this skill's `assets/timeline.template.ts` to `src/<video>/timeline.ts`. Every start and duration in the video lives in its `T` object, in **seconds**.
- Convert to frames only at the point of use (`seconds * fps`). Why: the video can change frame rate without a single timing edit, and seconds are what people talk in ("hold it a bit longer").
- `EXIT` (0.75s) and `SWAP` (0.6s) are the shared durations for leaving and swapping. Read them in the state, the sound cues and the sound generator; never retype 0.75 anywhere.
- Never hard-code a time in a component, note or cue. A literal time is a beat that won't move when the rest does.

## The beat pattern

Every design step runs the same rhythm:

| Beat | When |
|---|---|
| Change starts | step start |
| Change lands | +1.0–1.3s |
| Note starts writing | ~1.2s after the change starts |
| Note fully written | note start + `noteDuration(text)` (0.045s per character, ≥0.5s) |
| Note held, fully written | ≥3s |
| Note erased | ~1s before the next change |
| Step length | 7–8s |

- Open on the old design for ~2.5s before the first change. Hold the final frame ≥5s.
- A longer note needs a later erase: recompute `note + noteDuration(text) + 3` when you change a note's wording.
- A sequence of states (progress titles) runs ~1.4s per state, with a crossfade of `SWAP`.

Why these numbers: the viewer watches the change, then reads about it. Notes erased right after they finished writing could not be read, and that was the most repeated feedback on early cuts.

## Sequencing inside a step

- A part fading and the space it held closing: fade at `t`, close at `t + 0.25`.
- A part leaving, then another arriving in its place: start the arrival when the exit is ~60% done, so the slot is never empty and never doubled.
- A move, then a part entering after it: start the entry 0.3–0.5s after the move starts, not when it ends, so the step reads as one gesture.

## Syncing sound to picture

- Sounds for fades cue at the fade's **first visible frame**, not its nominal start: `visibleAt(start, duration, easing, VISIBLE.fade)` from `src/compose/motion.ts`. An eased fade is invisible for its first frames, and a sound before the picture feels early.
- Movement sounds cue at the move's nominal start. Their loudness follows the move's speed, so they are silent while the move is too small to see.
- Settle sounds (a thock) cue where the move is 92% done: `visibleAt(start, duration, IN_OUT, 0.92)`.
- Movement sounds are generated from the same `T` durations and easing. After any retime, regenerate them (`node scripts/make-<video>-sounds.mjs`) before rendering the sound cut, or a 1.2s move plays a 1.0s sound.
- Two sounds for one change sit ≥0.06s apart, so they read as one gesture, not a click.

## Retiming

1. Change only `timeline.ts` (plus the composition's `DURATION_S`).
2. When you remove or lengthen a step, shift every later beat by the same delta, including sequences of hard-coded stage times. Search for literals that escaped `T` (`grep -nE '[0-9]+\.[0-9]+' src/<video>/*.ts`).
3. Regenerate the sounds.
4. Check the beats with compose-audit's stills at the new times.
