---
name: compose-animate
description: Build the picture of a Remotion component breakdown video, where a UI component morphs from its old design to its new one step by step, with hand-drawn notes and a before/after close. Use when asked to make a design demo, component breakdown, redesign walkthrough or before/after video, or to add a composition to a Remotion demo project. Timing rules live in compose-timing, sound in compose-sounds, removing beats in compose-cleanup, checking renders in compose-audit.
---

# Compose: animate

A component breakdown video shows one real UI component changing from its old design (usually the base branch) to its new one, one design change at a time. The viewer watches the component, not slides about it.

## Set up once per project

Copy this skill's `assets/` into the Remotion project:

| Asset | Copy to | What it is |
|---|---|---|
| `motion.ts` | `src/compose/motion.ts` | `SOFT`/`IN_OUT` curves, `progress()`, `mix()`, `visibleAt()` |
| `fade.ts` | `src/compose/fade.ts` | the one arrive/leave style for every part |
| `fonts.ts` | `src/compose/fonts.ts` | variable Inter and the notes' hand |
| `useTextWidths.ts` | `src/compose/useTextWidths.ts` | measures strings before frame 0 |
| `sketch/*` | `src/compose/sketch/` | `HandNote`, `Callout`, `SketchStroke`, `shapes`, `ink` |
| `remotion.config.ts` | project root | 4K, near-lossless H.264 |

Dependencies: `remotion`, `@remotion/cli`, `@remotion/google-fonts`, `@remotion/paths` (v4). Never fork `src/compose/` per video: every video in the project shares it, and a per-video copy drifts.

Each video lives in `src/<video>/` with `timeline.ts`, `state.ts`, `layout.ts`, `tokens.ts`, the component, `notes/`, and the composition file.

## Before writing code

1. **Read the real component on both refs.** `git show <base>:<path>`, `git diff <base>...HEAD -- <path>`, and the commit log. Resolve every size, colour, weight and radius to px and hex from the design tokens into `tokens.ts`. Take every label, title and status string from the source. Why: reviewers recognise the product's own copy; an invented string reads as a different product.
2. **Pick 5–6 design changes, never more.** Group commits into visible changes. A change that only removes a minor control (a dismiss or secondary button) is not a step: fold it silently into the related step (the buttons fade as the footer folds away). Why: removal steps are tedious to watch and were cut in review.
3. **Order steps so each morph changes one thing.** When two changes touch one element, the one that changes its shape goes last.
4. **Use the user's data.** If they give a count or copy ("10k accounts"), use it everywhere, formatted the way the product formats numbers.

## Stage

- 1920×1080 at 60fps, `Config.setScale(2)` (from `remotion.config.ts`), so frames rasterise at 3840×2160. Never upscale a 1080p render.
- **Only the component, centred.** No title cards, step headings, step counters, kickers, process screens, plans or commit lists. They pull the eye off the component.
- **Wide and modest:** the component covers ~85% of the frame width (e.g. 680px wide at 2.4×). A narrow component at 3× reads as cramped. If the real one is narrower, widen its container, never its scale.
- One fixed width for the whole video. Height changes only through tweened values, and the component is re-centred from the tweened height (`top = cy - height * scale / 2`).

## No layout shift, ever

- Every part is one absolutely positioned element that lives for the whole video, placed by a pure function of the frame. Never mount a different element for the new version of a part: a swap jumps.
- `state.ts` turns the frame into plain 0→1 numbers, one per change (`state(frame, fps)`). `layout.ts` mixes old→new geometry by them (`layout(state, widths)`). The component and the notes both read `layout`, so arrows always land on their target.
- Measure every string with `useTextWidths` before frame 0. Anything placed after text (a badge after a title) uses the measured widths mixed by the crossfade weights, so it glides when the text changes.
- Tween font-weight on the variable font (`INTER_VAR`) instead of swapping weights.
- Draw the component at 1x CSS sizes inside a wrapper with `transform: scale(SCALE)`, `transform-origin: 0 0`. Why: every token stays in its real px and one number sets the size on the frame.

## Motion decision tree

```
Is the part leaving?
├── Yes → 0.75s, ease-in-out (IN_OUT): fade(1 - t)
└── No
    ├── Arriving? → 0.6s, ease-out (SOFT): fade(t)
    ├── Swapping in place (a title, a label)? → crossfade 0.6s, IN_OUT
    ├── Moving or resizing? → 1.0–1.3s, IN_OUT
    └── Constant (a spinner, a shimmer)? → linear, from the frame clock
```

- Never leave on an ease-out curve: it is fastest on its first frame, so the part blinks off. IN_OUT dissolves it.
- `fade()` scales to 0.97 and blurs 2.5px as a part goes, never to 0. A part shrinking to nothing reads as a bug.
- When a part fades and its space closes, fade first and close 0.25s later. Closing over visible text clips it.
- Scale text from its first letter (`origin: "left center"`) so it doesn't drift sideways while it fades.
- Never use `spring()`. Springs overshoot, and an overshoot reads as a layout shift in a design demo.

## States that only exist in motion

- **Progress or status text:** crossfade through the product's real stage strings, ~1.4s each, with its shimmer. Show them while the step's note explains them, then return to the resting title.
- **Hover-only UI:** show it, and say "shown on hover" in the note.
- **The finished flow:** after the last change, run the new component once through its real flow (working → done), then settle it back to the resting state for the close.

## Hand-drawn notes

- `HandNote` and `Callout` from `src/compose/sketch`, in the `INK` colour. They are the only text outside the component.
- One note per step, ≤8 words, naming the change in the reviewer's terms ("350 font-weight, the count at 400"). Use the user's exact wording when they give it.
- Place each note from the layout at the moment the note starts, never from the current frame: a note that follows a moving part wobbles.
- Spacing: a line with end ticks over the gap (`SketchStroke`) and the px value written beside it.

## The close: before and after

End on both designs stacked, old above new, in the **same state** with the same data. "Before" and "After" are handwritten (`HandNote`, ~46px) and left-aligned with the cards, with no subtitles. The new component glides down into the "After" place while the old one fades in above. Why: it is the frame people screenshot, so it must compare like with like.

## Output

- Render with `--timeout=120000`: Google Fonts can exceed the default 30s headlessly.
- Name renders `<video>-v<N>-4k.mp4`. Never overwrite a version the user asked to keep: bump `N`.
- Run compose-audit before telling the user the video is done.
