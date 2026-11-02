# Setup

How to prepare a Remotion project for compose videos. Do this once per project; every later video reuses it.

## 1. Packages

```bash
npm i remotion @remotion/cli @remotion/google-fonts @remotion/paths
```

Remotion v4. New project: `npx create-video@latest`, then the line above.

## 2. Copy the assets

From this skill's `assets/` folder:

| Asset | Copy to |
| --- | --- |
| `motion.ts` | `src/compose/motion.ts` |
| `fade.ts` | `src/compose/fade.ts` |
| `fonts.ts` | `src/compose/fonts.ts` |
| `useTextWidths.ts` | `src/compose/useTextWidths.ts` |
| `sketch/` (5 files) | `src/compose/sketch/` |
| `remotion.config.ts` | project root (merge with any existing config) |

What each one gives you:

| Export | From | Use |
| --- | --- | --- |
| `SOFT`, `IN_OUT` | `motion.ts` | arrivals (ease-out) and everything else (ease-in-out) |
| `progress(frame, fps, start, duration, easing)` | `motion.ts` | 0→1 over seconds, clamped and eased |
| `mix(from, to, t)` | `motion.ts` | old→new values |
| `visibleAt(start, duration, easing, threshold)` | `motion.ts` | the first visible second of an eased change, for sound cues |
| `fade(shown, { origin, transform })` | `fade.ts` | the one arrive/leave style |
| `INTER_VAR`, `HAND` | `fonts.ts` | variable Inter, and the notes' hand (Gloria Hallelujah) |
| `useTextWidths(specs)` | `useTextWidths.ts` | 1x string widths before frame 0 |
| `HandNote`, `Callout`, `SketchStroke` | `sketch/` | notes, arrowed notes, pen strokes |
| `penLine`, `arrowHead`, `bracket`, `looseOval` | `sketch/shapes.ts` | stroke paths |
| `INK` | `sketch/ink.ts` | the notes' colour, `#E8553F` |

## 3. Lay out the video

```
src/<video>/
  timeline.ts      every beat, in seconds (from compose-timing)
  tokens.ts        colours, 1x sizes, SCALE
  state.ts         state(frame, fps) → 0→1 per change
  layout.ts        layout(state, widths) → positions and sizes
  <Component>.tsx  the component, every part absolutely positioned
  notes/Notes.tsx  hand-drawn notes, placed from layout
  <Video>.tsx      the composition
```

## 4. Register the composition

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { DURATION_S, FPS } from "./<video>/timeline";
import { <Video> } from "./<video>/<Video>";

<Composition
  id="<Video>"
  component={<Video>}
  durationInFrames={Math.round(DURATION_S * FPS)}
  fps={FPS}
  width={1920}
  height={1080}
/>
```

Add scripts to `package.json`:

```json
"render:<video>": "remotion render <Video> out/<video>-v1-4k.mp4 --timeout=120000",
"still:<video>": "remotion still <Video> --timeout=120000"
```

## 5. Check it

```bash
npx tsc --noEmit
npx remotion studio
```
