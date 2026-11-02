---
name: compose-audit
description: Audit a Remotion component breakdown video's design and output before handing it over: contact sheets of stills at every beat, layout stability, note readability, fidelity to the real component's tokens and copy, 4K output and audio levels. Use after building or changing a composition, or when asked to review, check, QA or audit a demo video.
---

# Compose: audit

Never tell the user a breakdown video is done from a type-check. Look at the frames. Every check below caught a real problem in an earlier cut.

## 1. Contact sheet

Copy `assets/stills.sh` into the project's `scripts/`, then pass the seconds to check:

```bash
bash scripts/stills.sh <CompositionId> 60 <seconds...>
```

Pick, for every step: the frame before the change, the middle of each exit, the frame the note is fully written, and the frame before it erases. Add the first and last frames (the last frame is `DURATION_S − 1/fps`). Read `out/stills/<id>/grid.png`, not each file: neighbouring stills side by side are how shifts show.

## 2. Design audit

**Frame**
- Only the component and hand-drawn notes are on screen.
- The component covers ~85% of the frame width and sits centred.

**Stability**
- The component's width is identical in every still.
- Nothing moves between neighbouring stills unless a step moved it.
- Parts placed after text (badges, chips) keep the same gap after it in every title state.
- Mid-exit stills show a soft blurred dissolve, never a half-clipped part or a part cut by the card edge.

**Motion**
- Leaving parts fade, blur and shrink slightly; none vanish between two neighbouring frames.
- Nothing overshoots its final place.

**Notes**
- Each note is fully written and on screen ≥3s, and gone before the next change starts.
- Arrows land on what they name. No note covers the component or runs off the frame.
- Wording matches what the user asked for, word for word.

**Fidelity**
- Every colour, size, weight and radius in `tokens.ts` matches the source component's tokens on the right ref. Spot-check three against the source.
- Every label, title and number matches the source or the user's data. Grep the source for any string you're unsure of.
- Icons are the product's own glyphs at its stroke width, not lookalikes.
- The close shows both designs in the same state, labelled only "Before" and "After".

## 3. Output

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of csv=p=0 <file>
```

Expect `3840,2160,60/1` and the timeline's duration. For a sound cut, check the levels (compose-sounds) and that it has an audio stream. Confirm that versions the user asked to keep still exist with their old timestamps (`ls -la out/`).

## 4. Report

Tell the user what you checked (stills, resolution, levels) and what you did not (you didn't watch or listen to the full playback). Never say a video "plays smoothly" from stills alone.
