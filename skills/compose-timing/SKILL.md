---
name: compose-timing
description: Pace and synchronise a Remotion component breakdown video, so every motion, hand-drawn note and sound effect lands on the right frame and stays readable. Owns the video's timeline.ts. Use when setting up a timeline, retiming beats, making notes stay up longer, fixing sounds that land early or late, or checking that audio matches the picture. Pairs with compose-animate and compose-sounds.
---

# Compose: timing

## Initial Response

When this skill is first invoked without a specific request, respond only with:

> I'm ready to pace your video. Tell me what to retime, or which video's timeline to set up.

Do not provide any other information until the user asks.

A pacing skill. It does ONE thing: own `src/<video>/timeline.ts` and keep the picture, the notes and the sounds on one clock. It does not design the motion (that's `compose-animate`), make sounds (`compose-sounds`) or remove beats (`compose-cleanup`, which calls this skill to close the gap).

## Operating Posture

Every timing complaint is a reading complaint: the viewer couldn't see the change, or couldn't finish the note. Pace for someone watching a component they have never seen, at normal speed, once.

## Hard Rules

1. **One timeline, in seconds.** Every start and duration lives in `T` in `timeline.ts`. Convert to frames only where a value is used (`seconds * fps`).
2. **No literal times anywhere else.** A time typed into a component, note or cue is a beat that won't move with the rest.
3. **`EXIT` and `SWAP` are read, never retyped.** State, cues and the sound generator all import them.
4. **A note is held ≥3s once fully written,** and erased ≥0.8s before the next change starts.
5. **Sounds for fades cue at the first visible frame**, from `visibleAt()`, never at the nominal start.
6. **Retiming regenerates the sounds.** Movement sounds are built from `T`; a stale sound plays the old duration.

## The Beat Pattern

Every design step follows this rhythm:

| Beat | When |
| --- | --- |
| Change starts | step start |
| Change lands | +1.0–1.3s |
| Note starts writing | ~1.2s after the change starts |
| Note fully written | note start + `noteDuration(text)` (0.045s/char, min 0.5s) |
| Note held | ≥3s after fully written |
| Note erased | ≥0.8s before the next change |
| Step length | 7–8s |

Also:

- Open on the old design for ~2.5s before the first change.
- A sequence of states (progress titles) runs ~1.4s per state.
- Hold the final frame ≥5s.

Inside a step:

- **Fade, then close.** A part fades at `t`; the space it held closes at `t + 0.25`.
- **Leave, then arrive.** A replacement starts arriving when the leaving part is ~60% gone, so the slot is never empty or doubled.
- **Move, then enter.** A part that enters after a move starts 0.3–0.5s into the move, so the step reads as one gesture.

## Syncing Sound to Picture

| The sound is for… | Cue it at |
| --- | --- |
| a fade (plip, tick) | `visibleAt(start, duration, easing, VISIBLE.fade)` |
| a move | the move's nominal start (its loudness follows the move's speed) |
| a settle (thock) | `visibleAt(start, duration, IN_OUT, 0.92)` |
| a title stage | `visibleAt(stage.at, SWAP, IN_OUT, VISIBLE.fade)` |
| a second sound for the same change | ≥0.06s after the first |

## The Sequence

### Setting up a timeline

1. Copy `assets/timeline.template.ts` to `src/<video>/timeline.ts`.
2. One block in `T` per step, 7–8s apart, using the beat pattern.
3. Set `DURATION_S` to the last beat plus ≥5s of hold.

### Retiming

1. Change only `timeline.ts`, and the composition length through `DURATION_S`.
2. Moving or removing a beat shifts every later beat by the same delta. Find literals that escaped `T`:
   ```bash
   grep -rnE '\b[0-9]+\.[0-9]+\b' src/<video> --include='*.ts' --include='*.tsx'
   ```
3. A note's wording changed? Recompute its erase: `note + noteDuration(text) + 3`.
4. Regenerate the sounds: `npm run sounds:<video>`.
5. Check the moved beats with `compose-audit` (stills at the new times).

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| bare | Initial Response, then wait |
| `setup <video>` | Set up a timeline from the template |
| "notes are too fast", "hold it longer" | Lengthen holds to the beat pattern, then shift later beats |
| "sound is early/late" | Re-derive cues from the table above, then regenerate |
| `check` | Read `timeline.ts` and report every beat that breaks the pattern: note held <3s, erase <0.8s before the next change, step <7s |
