# Recipes

Working patterns from shipped compose videos. Copy the shape, change the parts. Every snippet assumes the assets from [SETUP.md](SETUP.md) are in `src/compose/`.

## State and layout

`state.ts` turns the frame into one 0→1 number per change. `layout.ts` mixes old→new geometry by those numbers. Neither touches React.

```ts
// state.ts
import { IN_OUT, SOFT, progress } from "../compose/motion";
import { EXIT, SWAP, T } from "./timeline";

export const state = (frame: number, fps: number) => {
  const p = (start: number, duration: number, easing = SOFT) =>
    progress(frame, fps, start, duration, easing);
  const out = (start: number) => p(start, EXIT, IN_OUT);

  return {
    intro: p(T.intro.start, T.intro.duration),
    weight: p(T.type.change, T.type.changeDuration, IN_OUT),
    descInk: 1 - out(T.oneLine.change),                          // fades first…
    desc: 1 - p(T.oneLine.change + 0.25, 1.1, IN_OUT),           // …then its line closes
    merge: p(T.oneRow.merge, T.oneRow.mergeDuration, IN_OUT),
  };
};
export type State = ReturnType<typeof state>;
```

```ts
// layout.ts
import { mix } from "../compose/motion";

export const layout = (k: State, w: Widths) => {
  const rowH = mix(24, 28, k.merge);
  const descBlock = (8 + 20) * k.desc;                // height that closes to 0
  const footerH = 45 * (1 - k.merge);
  const height = 10 * 2 + rowH + descBlock + footerH;
  return { rowH, height, rowMid: 10 + rowH / 2 /* … */ };
};
```

The component wraps itself in one scaled div and centres on its tweened height:

```tsx
const top = STAGE.cy - (l.height * SCALE) / 2;
<div style={{ position: "absolute", left, top, width: G.width, height: l.height,
  transform: `scale(${SCALE})`, transformOrigin: "0 0", overflow: "hidden" }}>
```

## A persistent part

One element for the whole video; its old and new looks are mixes, and it leaves by `fade()`.

```tsx
<div style={{
  position: "absolute",
  left: l.padL,
  top: l.rowMid - 9,
  ...fade(1 - k.circlesOut, {
    origin: "left center",
    transform: `translateX(${-8 * k.circlesOut}px)`,   // drifts as it dissolves
  }),
}}>
  <OldLogos />
</div>
```

A button that becomes a plain label keeps one element: its plate fades (`opacity: 1 - k.restyle`), its text colour interpolates (`interpolateColors`), its width mixes between the two measured labels, and the two labels crossfade inside it.

## Text that other parts follow

Measure before frame 0, then place followers from the measured widths mixed by whatever is showing:

```ts
const TEXT = {
  count: { text: "10,000", weight: 400, size: 13 },
  rest: { text: " accounts from inbound.csv", weight: 350, size: 13 },
};
const widths = useTextWidths(TEXT);            // null until fonts load
if (widths === null) return <AbsoluteFill style={{ background: "#fff" }} />;

// in layout: a badge 8px after whichever title is showing
const titleW = TITLES.reduce((sum, stage, i) =>
  sum + k.titles[i] * (stage.text ? w.titles[i] : w.count + w.rest), 0);
const badgeX = titleX + titleW + 8 - 8 * (1 - badgeShown);   // slides in from 8px left
```

## Title track

A list of title stages, each shown from its time to the next one's, crossfading by `SWAP`:

```ts
export const TITLES: { at: number; text: string | null; working?: boolean }[] = [
  { at: 0, text: null },                                         // the resting title
  { at: 11.0, text: "Opening inbound.csv", working: true },
  { at: 12.4, text: "Reading row 6,400 of 10,000 in inbound.csv", working: true },
  { at: 13.8, text: "10,000 accounts imported" },
  { at: 15.2, text: null },                                      // back to rest
];

// in state
titles: TITLES.map((stage, i) => {
  const next = TITLES[i + 1];
  const into = i === 0 ? 1 : p(stage.at, SWAP, IN_OUT);
  return into - (next ? p(next.at, SWAP, IN_OUT) : 0);
}),
```

Render every stage as its own absolutely positioned element with `fade(k.titles[i], { origin: "left center" })`. Working stages get the product's shimmer, a gradient through `background-clip: text` moved by the frame clock.

## Notes

Place a note from the layout at the second it starts, not the current frame, so it never wobbles while the component tweens:

```tsx
const at = (seconds: number) => {
  const k = state(Math.round(seconds * fps), fps);
  const l = layout(k, w);
  return { l, frame: cardFrame(l) };                  // cardFrame maps 1x → frame px
};
const s1 = at(T.type.note);
const count = s1.frame.at(s1.l.titleX + 16, s1.l.rowMid - 9);

<Callout
  text="350 font-weight, the rows count at 400 weight"
  anchor={{ x: count.x - 60, y: count.y - 110 }}
  from={{ x: count.x - 10, y: count.y - 82 }}
  to={{ x: count.x + 6, y: count.y - 6 }}
  bend={-16}
  start={T.type.note}
  eraseAt={T.type.erase}
  seed="type"
/>
```

A spacing mark is a line with a tick at each end, drawn by `SketchStroke`, with the value written beside it by a `HandNote`:

```ts
const dimension = (a: Point, b: Point, tick = 9) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const n = { x: (-(b.y - a.y) / len) * tick, y: ((b.x - a.x) / len) * tick };
  const seg = (p: Point, q: Point) => `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
  return [seg({ x: a.x - n.x, y: a.y - n.y }, { x: a.x + n.x, y: a.y + n.y }),
          seg(a, b),
          seg({ x: b.x - n.x, y: b.y - n.y }, { x: b.x + n.x, y: b.y + n.y })].join(" ");
};
```

## Before/after close

Stack the two cards as one block, centred on the frame:

```ts
const HEADING = 52, GAP = 22, BETWEEN = 84;
const BLOCK = HEADING * 2 + GAP * 2 + OLD_H + BETWEEN + NEW_H;   // frame px
const top = (1080 - BLOCK) / 2;
export const COMPARE = {
  beforeHeading: top,
  beforeCy: top + HEADING + GAP + OLD_H / 2,
  afterHeading: top + HEADING + GAP + OLD_H + BETWEEN,
  afterCy: top + HEADING * 2 + GAP * 2 + OLD_H + BETWEEN + NEW_H / 2,
};
```

- The live component's `cy` mixes from the stage centre to `afterCy` by `k.compare` (1.3s, `IN_OUT`).
- The old component is a second instance of the same component, given `state()` from a frame before any change (e.g. `2.2 * fps`), drawn at `beforeCy` and faded in.
- Before the glide, settle the live component to its resting state (title and slot back to rest), so both cards show the same state.
- `HandNote` writes "Before" and "After" at size ~46, with `x = left − 46 × 0.3` so the ink, not the box, lines up with the card edge.
