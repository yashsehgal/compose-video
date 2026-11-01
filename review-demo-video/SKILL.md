---
name: review-demo-video
description: Review a rendered Remotion component demo video before handing it over: stills at every beat, readability of notes, layout stability, copy accuracy against the source, 4K output and audio levels. Use after building or changing a component-demo-video, or when asked to check, verify or QA a demo video.
---

# Review a demo video

Never tell the user a demo video is done from a type-check alone. Look at it. Every item below was a real piece of feedback on an earlier render.

## 1. Stills at every beat

Render half-scale stills at the frame each change lands, the frame each note is fully written, and the last frame:

```bash
npx remotion still <Comp> out/stills/f<frame>.png --frame=<frame> --scale=0.5 --timeout=120000 --log=error
```

Frames are `seconds × fps`; the last frame is `DURATION_S × fps − 1`. Tile them into one grid image (PIL) and read the grid, not each file. Add a mid-transition frame for every exit: that is where blinking and clipping show.

## 2. Checklist

**Frame**
- Only the component and hand-drawn notes are on screen: no headings, step counters or labels outside the component.
- The component covers ~85% of the frame width and sits centred.

**Stability**
- Width is the same in every still. Between neighbouring stills, nothing jumps: a part moved only if a step moved it.
- Parts placed after text (badges, chips) sit the same gap after the text in every title state.
- Mid-exit frames show a soft blurred dissolve, never a half-clipped part.

**Notes**
- Each note is fully written and still on screen ≥3s before it erases, and is erased before the next change starts.
- Arrows land on the part they name. No note covers the component or runs off the frame.
- The note's wording is the user's, when they gave it.

**Accuracy**
- Every label, title and number matches the source component on the right ref, or the number the user asked for. Grep the source for each string you are unsure of.
- The comparison close shows both designs in the same state, with only "Before"/"After" in the hand.

## 3. Output

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of csv=p=0 <file>
```

Expect `3840,2160,60/1` and the timeline's duration. For a sound cut, also run `ffmpeg -af volumedetect` (targets in demo-video-sounds).

Confirm the versions the user asked to keep still exist with their old timestamps (`ls -la out/`).

## 4. Report

Tell the user what you checked (stills, resolution, levels) and what you did not (you did not watch or listen to the full playback). Never claim a video "plays smoothly" from stills.
