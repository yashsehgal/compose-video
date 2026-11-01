---
name: component-demo-video
description: Build a Remotion video that walks a UI component from its old design to its new one, step by step, with hand-drawn notes and a before/after close. Use when asked to make a design demo, component breakdown, redesign walkthrough or "before and after" video of a component, or to add a new composition to the Remotion demo repo. For sound, use demo-video-sounds; for checking a render, use review-demo-video.
---

# Component demo video

A component breakdown video shows one component changing from its old design (usually the `dev` branch) to its new one (the current branch), one design change at a time. The viewer watches the component itself, not slides about it.

The reference project is `/Users/yashsehgal/badge-video`. `src/importCard/` is the most complete example; `src/` root is the first one (BadgeExplainer). Reuse its `src/motion.ts` and `src/components/sketch/*` (HandNote, Callout, SketchStroke, shapes) as they are. Never fork them per video: other videos depend on them.

## Before writing any code

1. **Diff the real component.** Read the component on both refs (`git show origin/dev:<path>`, `git diff origin/dev...HEAD -- <path>`) and the commit log. Every size, colour, weight, label and copy line in the video comes from that code, resolved to hex and px. Never invent copy: the app's own strings (status titles, button labels, receipts) are what reviewers recognise, and a made-up string reads as a different product.
2. **Pick 5–6 design changes, no more.** Group commits into visible changes (type weight, layout row, buttons, logo treatment, spacing). Drop changes that are only removals of minor controls: they are tedious to watch. Fold such a removal silently into the related step instead (the buttons fade out as the footer folds away), with no note of its own.
3. **Order the steps so each morph changes one thing.** If two changes touch the same element, the one that changes its shape goes last.

## Frame and stage

- 1920×1080 composition at 60fps, with `Config.setScale(2)` in `remotion.config.ts` so every frame rasterises at 3840×2160. Never upscale a 1080p render: text edges go soft.
- **Only the component, centred.** No title cards, step headings, "1 / 6" counters, kickers, process panels, commit lists or plan screens. They pull the eye off the component and were cut in review every time.
- **Draw the component wide and modest.** Scale it so it covers about 85% of the frame width (e.g. a 680px-wide card at 2.4×). A narrow card at 3× reads as cramped and shrinking. If the real component is narrower, widen its container, not its scale.
- One fixed component width for the whole video. Height changes only through tweened values, and the component is re-centred from the tweened height (`top = cy - height * scale / 2`), so it grows and shrinks about its middle.

## No layout shift, ever

- Every part is one absolutely positioned element that lives for the whole video and is placed by a pure function of the frame. Never mount a different element for the "after" version of a part: swaps cause jumps.
- Keep geometry in one `cardLayout(state, widths)` function that mixes old→new values by each step's progress. Notes read the same function, so arrows always hit what they point at.
- Measure every string before the first frame (canvas `measureText` after `document.fonts.load`, wrapped in `delayRender`). Anything placed after text (a badge after a title) uses the measured width, mixed by the crossfade weights, so it glides instead of jumping when the text changes.
- Load Inter with `loadVariableFont` from `@remotion/google-fonts/Inter`, so font-weight can tween (500 → 350) instead of snapping.

## Timing

All times live in one `timeline.ts` object, in seconds. Every step runs the same pattern:

| Beat | Time |
|---|---|
| Change lands | 1.0–1.3s |
| Note starts | ~1.2s after the change starts |
| Note held | ≥3s after it finishes writing |
| Note erased | ~1s before the next change |
| Step total | 7–8s |

Why: the viewer has to watch the change and then read about it. A note erased the moment it finishes writing cannot be read, and that was the most repeated piece of feedback.

Open on the old design for ~2.5s before the first change. Hold the last frame ≥5s.

## Motion: the decision tree

```
Is the part leaving?
├── Yes → EXIT: 0.75s, ease-in-out, opacity→0, blur→2.5px (at 1x), scale→0.97
└── No
    ├── Is it arriving? → 0.6s, ease-out (SOFT), the same blur/scale in reverse
    ├── Is it swapping in place (title, label)? → crossfade 0.6s, ease-in-out
    ├── Is it moving or resizing? → 1.0–1.3s, ease-in-out
    └── Is it constant (a spinner)? → linear, driven by the frame clock
```

- Exits never use an ease-out curve: it moves fastest on its first frame, so the part looks like it blinks off. Ease-in-out dissolves it.
- Scale exits to 0.97, never 0: a part that shrinks to nothing reads as a bug, not a fade.
- When a part fades and the space it held closes, fade first, then close 0.25s later. Closing over visible text clips it.
- Scale text about its first letter (`transform-origin: left center`) so it doesn't drift sideways while it fades.
- Use the `SOFT` and `IN_OUT` curves and the `progress()` helper from `src/motion.ts`. Never `spring()`: springs overshoot, which reads as a layout shift in a design demo.

## Showing states that only exist in motion

- **Progress or status text:** crossfade through the app's real stage strings, ~1.4s each, with the shimmer the app uses. Show it while the step's note explains it, then return to the resting title.
- **Hover-only UI** (a label that appears on hover): show it, and say so in the note ("Review accounts, shown on hover").
- **The working state:** after the last design change, run the finished component once through its real flow (reading → working → done), then settle it back to the resting state for the comparison.

## Hand-drawn notes

- Notes use `HandNote`/`Callout` in Gloria Hallelujah, ink `#E8553F`. They are the only text outside the component.
- One note per step, ≤8 words, naming the change in the reviewer's terms ("350 font-weight, the rows count at 400 weight"). Use the user's exact wording when they give it.
- Place each note from the layout as it stands when the note starts, never from the current frame: a note that tracks a moving part wobbles.
- Spacing marks: draw a line with end ticks over the gap and write the px value next to it.

## The close: before and after

End every video with both designs stacked, old above new, in the **same state** (both ready, same data). "Before" and "After" are written by hand in the notes' ink, left-aligned with the cards, with no subtitles ("on dev" was cut). The finished component glides down into the "After" place while the old one fades in above. Why: it is the one frame people screenshot and share, so it must compare like with like.

## Versions and output

- Name renders `<video>-v<N>-4k.mp4` and `<video>-v<N>-4k-sound.mp4`. When the user says to keep a version, never overwrite its file: bump `N`.
- Render with `--timeout=120000`: Google Fonts can take over the default 30s to load headlessly.
- Hand off to `review-demo-video` before telling the user the video is done.
