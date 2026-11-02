---
name: compose-animate
description: Build a Remotion component breakdown video, where one real UI component morphs from its old design to its new one a change at a time, with hand-drawn notes and a before/after close. Reads the component on both git refs and writes the composition. Use when asked to make a design demo, component breakdown, redesign walkthrough or before/after video. For pacing use compose-timing; for sound use compose-sounds; for cutting beats use compose-cleanup; for checking a render use compose-audit.
---

# Compose: animate

## Initial Response

When this skill is first invoked without a specific request, respond only with:

> I'm ready to turn a component's redesign into a breakdown video. Tell me the component and the two refs to compare (for example `origin/dev` and this branch).

Do not provide any other information until the user asks.

A construction skill. It does ONE thing: turn a component's redesign into a Remotion composition that would pass `compose-audit` the first time. It does not pace beats in detail (that's `compose-timing`), add sound (`compose-sounds`), remove beats (`compose-cleanup`) or review renders (`compose-audit`).

## Operating Posture

You are a design engineer making a short film about one component. The viewer watches the component change and reads one note about each change. Nothing else is on screen.

Two failure modes, and the first is worse:

1. **Something moves that the design change didn't move.** A jump, a re-centre, a badge that snaps when the title changes. It reads as a bug in the product.
2. **The video explains instead of showing.** Title cards, step counters, process scenes, commit lists. They pull the eye off the component and were cut in every review.

Make the calls yourself: which changes, in which order, at which scale. State each call in one line and build it.

## Hard Rules

1. **Real source only.** Every token, label, title and status string comes from the component's code on the two refs, or from data the user gives. Never invent copy.
2. **5–6 design changes, never more.** A change that only removes a minor control (a dismiss or secondary button) is never its own step: its parts fade out as the neighbouring step starts.
3. **Only the component and hand-drawn notes on screen.** No headings, counters, kickers, subtitles or process scenes.
4. **One persistent element per part,** placed by a pure function of the frame. Never mount a different element for the new version of a part.
5. **One width for the whole video,** covering ~85% of the frame. Height only tweens, and the component re-centres from the tweened height.
6. **No `spring()`.** Springs overshoot, and an overshoot reads as a layout shift.
7. **Never fork the shared code** in `src/compose/` per video. Every video in the project imports it.
8. **4K out, versions kept.** `Config.setScale(2)`. Renders are named `<video>-v<N>-4k.mp4`; a version the user asked to keep is never overwritten.

## The Build Sequence

### 1. Set up the project (first video only)

Follow [SETUP.md](SETUP.md): copy the assets into `src/compose/`, install the four Remotion packages, and register the composition.

### 2. Read the component on both refs

```bash
git log --oneline <base>..HEAD -- <component dir>
git show <base>:<component file>
git diff <base>...HEAD -- <component dir>
```

Write `src/<video>/tokens.ts`: every colour as hex, every size, radius and weight as 1x px, resolved from the design tokens (CSS variables, Tailwind config). Copy the exact strings the component renders in each state.

### 3. Pick and order the changes

Group the commits into visible changes: type, rows, controls, imagery, spacing. Keep 5–6. Order them so each morph changes one thing; when two changes touch one element, the one that changes its shape goes last.

State the list to the user in one line per change before building.

### 4. Build state and layout

- `state.ts`: `state(frame, fps)` returns one 0→1 number per change, from `progress()` with the curve from step 5.
- `layout.ts`: `layout(state, widths)` mixes old→new geometry by those numbers and returns every position and size the component and notes need.
- Measure every string with `useTextWidths` before frame 0.

Patterns: [RECIPES.md](RECIPES.md) § State and layout, § Text that other parts follow.

### 5. Pick the motion for each part

| The part is… | Duration | Curve | How |
| --- | --- | --- | --- |
| Leaving | 0.75s (`EXIT`) | `IN_OUT` | `fade(1 - t)` |
| Arriving | 0.6s (`SWAP`) | `SOFT` | `fade(t)` |
| Swapping in place (title, label) | 0.6s | `IN_OUT` | crossfade two `fade()`s |
| Moving or resizing | 1.0–1.3s | `IN_OUT` | `mix()` positions |
| Changing weight | 1.2s | `IN_OUT` | tween `fontWeight` on `INTER_VAR` |
| Constant (spinner, shimmer) | — | linear | frame clock |

- **Never leave on `SOFT`.** An ease-out curve is fastest on its first frame, so the part blinks off.
- **Never scale to 0.** `fade()` stops at 0.97 with a 2.5px blur: a part shrinking to nothing reads as a bug.
- **Fade, then close.** When a part's space closes after it, start closing 0.25s after the fade starts. Closing over visible text clips it.
- **Text scales from its first letter** (`origin: "left center"`), so it doesn't drift sideways.

### 6. Show the states that only exist in motion

- **Progress text:** crossfade the product's real stage strings, ~1.4s each, during the step whose note explains them. Then return to the resting title. ([RECIPES.md](RECIPES.md) § Title track.)
- **Hover-only UI:** show it, and write "shown on hover" in its note.
- **The finished flow:** after the last change, run the new component once through working → done, then settle it back to rest for the close.

### 7. Write the notes

- `HandNote` or `Callout`, one per step, ≤8 words, in the reviewer's terms. Use the user's exact wording when given.
- Place each note from `layout` at the moment it starts, never the current frame. ([RECIPES.md](RECIPES.md) § Notes.)
- Spacing changes: a ticked dimension line plus the px value.
- Timing comes from `compose-timing`: each note is held ≥3s once written.

### 8. Close on before and after

Both designs stacked, old above new, in the same state with the same data. "Before" and "After" are handwritten, left-aligned with the cards, with no subtitles. The new component glides down into place while the old one fades in above. ([RECIPES.md](RECIPES.md) § Before/after close.)

### 9. Render and hand off

```bash
npx remotion render <Composition> out/<video>-v<N>-4k.mp4 --timeout=120000
```

The 120s timeout is needed: Google Fonts can exceed the default 30s headlessly. Then run `compose-audit` before telling the user it's done.

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| bare | Initial Response, then wait |
| a component and two refs | Full sequence, steps 1–9 |
| `plan` + component | Steps 2–3 only: list the changes and their order, write no code |
| a single change ("make the badge slide in from the left") | Edit the existing composition: steps 4–7 for that part only, then re-render |
| `close` | Add or rebuild the before/after close (step 8) |
