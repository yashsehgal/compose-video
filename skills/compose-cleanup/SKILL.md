---
name: compose-cleanup
description: Remove scenes, steps, labels or effects from a Remotion component breakdown video cleanly, and tidy the project afterwards: dead state, orphaned notes and sounds, stale assets and old renders. Use when asked to cut, drop or simplify part of a demo video, shorten it, remove headings or process scenes, or clean up a Remotion demo project.
---

# Compose: clean up

A beat in a breakdown video touches up to six places: the timeline, the state, the layout, the component, the notes and the sound cues. Removing it from only some of them leaves invisible state, a stray note, or a sound with no picture.

## Removing a beat or scene

Work through every place, in this order:

1. **Timeline:** delete the beat from `T`. Shift every later beat back by the removed length so the rhythm stays intact, and lower `DURATION_S` by the same amount (compose-timing). Include hard-coded stage times that escaped `T`.
2. **State:** delete the beat's values from `state.ts`.
3. **Layout and component:** delete every use of those values. If the beat's parts must still leave the frame, fold their exit into the neighbouring step (fade them together as that step starts) instead of keeping their own beat.
4. **Notes:** delete the beat's note, plus any cursor or helper only it used.
5. **Sounds:** delete its cues from `SoundCues.tsx` and its generators from the sound script, then regenerate the sounds.
6. **Text specs:** delete strings from the measured `TEXT` that nothing renders any more.
7. **Files:** delete components and data modules only the beat used (a process panel, a commit snapshot).

Then:

```bash
npx tsc --noEmit
grep -rnE '<removedName>|<removedField>' src/<video>
```

Both must come back empty. Type errors after a removal are leftovers, never something to cast away.

## What to cut when asked to simplify

- Header titles, step counters, kickers and subtitles: cut entirely. The component alone carries the video.
- Process scenes (plans, commit lists, history): cut entirely. They aren't design.
- Steps that only remove minor controls: fold them into a neighbouring step as above.
- Subtitles under "Before"/"After": cut, keep the handwritten word.

## Tidying the project

- **Stills:** compose-audit writes to `out/stills/`. Delete a video's stills folder by its full path once the review is done. Never use a glob after `cd` in the same command; a wrong working directory turns it into a removal somewhere else.
- **Renders:** keep every version the user asked to keep. Delete only working renders that were superseded within one iteration, and only by exact file name.
- **Sounds:** `writeSounds` rebuilds the video's own folder; never hand-delete files from another video's `public/sfx-*`.
- **Shared code:** never remove an export from `src/compose/` because one video stopped using it; another video may still import it. `grep -rn <export> src` first.
- **Dead comments:** update comments that still describe a removed beat ("six changes" after one was cut).

## Before handing back

Run compose-audit on the new cut, with stills at the seam where the beat was removed. That's where a missing exit or a double sound shows.
