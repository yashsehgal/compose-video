---
name: compose-cleanup
description: Remove scenes, steps, labels or effects from a Remotion component breakdown video cleanly, and tidy the project afterwards (dead state, orphaned notes and sounds, stale stills and renders). Use when asked to cut, drop or simplify part of a demo video, shorten it, remove headings or process scenes, or clean up a Remotion demo project.
---

# Compose: clean up

## Initial Response

When this skill is first invoked without a specific request, respond only with:

> I'm ready to cut or tidy. Tell me what to remove from which video, or say "tidy" to clean the project.

Do not provide any other information until the user asks.

A subtraction skill. It does ONE thing: take a beat, scene or effect out of a video so that nothing of it is left: no state, note, sound or gap. It does not redesign what remains (that's `compose-animate`) or re-pace it beyond closing the gap (`compose-timing`).

## Operating Posture

A beat lives in up to six places: the timeline, the state, the layout and component, the notes, the sound cues, and the measured text. Removing it from some of them leaves invisible state, a note pointing at nothing, or a sound with no picture. Done means a search for its name finds nothing.

## Hard Rules

1. **Remove from every place, in order** (the sequence below). Never stop when the picture looks right.
2. **Close the gap.** Shift every later beat back by the removed length, and shorten `DURATION_S` by the same amount.
3. **Parts that must still leave fold into a neighbour.** When a removed step was the only exit for some parts (buttons), fade them out together as the neighbouring step starts, with no note and one sound.
4. **Type errors after a removal are leftovers.** Delete what they point at; never cast them away.
5. **Never remove shared code** from `src/compose/` because one video stopped using it. Check other videos' imports first.
6. **Delete files by exact path.** Never a glob after a `cd` in the same command: a wrong working directory turns it into a removal somewhere else.
7. **Keep every version the user asked to keep.** Only superseded working renders from the current iteration may be deleted.

## The Sequence

### Removing a beat

1. **Timeline:** delete the beat from `T` and shift later beats (`compose-timing` § Retiming). Include stage times that escaped `T`.
2. **State:** delete the beat's values from `state.ts`.
3. **Layout and component:** delete every use of those values. Apply Hard Rule 3 for parts that still have to leave.
4. **Notes:** delete the beat's note, and any cursor, helper or position only it used.
5. **Sounds:** delete its cues from `SoundCues.tsx` and its `move()` entries from the sound script. Regenerate.
6. **Measured text:** delete `TEXT` entries nothing renders any more.
7. **Files:** delete components and data modules only the beat used.
8. **Comments:** fix any that still count or describe the removed beat ("six changes").

Then all three must come back clean:

```bash
npx tsc --noEmit
grep -rnE '<removedName>|<removedField>' src/<video>
grep -rn "<removedSound>" src/<video> scripts/make-<video>-sounds.mjs
```

### What to cut when asked to simplify

| On screen | Action |
| --- | --- |
| Titles, step counters, kickers, subtitles | Cut entirely |
| Process scenes (plans, commits, history) | Cut entirely, including their data files |
| A step that only removes minor controls | Fold into a neighbour (Hard Rule 3) |
| Subtitles under "Before"/"After" | Cut; keep the handwritten word |
| A hover cursor that demonstrates a click | Cut along with its step |

### Tidying the project

| What | Rule |
| --- | --- |
| `out/stills/<id>/` | Delete by full path once its review is done |
| Renders | Keep named versions; delete superseded working renders by exact file name |
| `public/sfx-<video>/` | Rebuilt by its own script; never hand-edit another video's folder |
| `src/compose/` exports | Remove only after `grep -rn <export> src` finds no importer |

## Required Output

End with a list of every place touched, one line each (`timeline.ts: removed controls, shifted 8.1s`), the new duration, and the result of the three checks. Then run `compose-audit` with stills at the seam where the beat was removed: that's where a missing exit or a double sound shows.

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| bare | Initial Response, then wait |
| a beat or element ("drop the Review step") | Removing a beat, steps 1–8 |
| `simplify` | Apply the cut table to the current video, then list what was cut |
| `tidy` | Tidying the project only; touch no composition code |
