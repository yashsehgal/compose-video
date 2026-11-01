---
name: demo-video-sounds
description: Add subtle, well-timed sound effects to a Remotion component demo video, sized to each layout and design change. Use when asked to add sound, SFX or audio to a design demo or component breakdown video, or to make a "with sound" version of one. Builds on component-demo-video's timeline.
---

# Demo video sounds

Sound in a component demo is felt, not heard. Every sound sits under one visible change and is as loud as that change is large. The reference is `/Users/yashsehgal/badge-video`: `scripts/sfx.mjs` (generators), `scripts/make-import-sounds.mjs` (one video's sound set), `src/importCard/components/ImportSoundCues.tsx` (its cue list).

## Rules

- **Synthesize, never download.** Generate every sound with `scripts/sfx.mjs` from a seeded random source. Why: the files are identical on every run, nothing is licensed, and a sound can be reshaped from the same easing curve as the motion it plays under.
- **Never edit the generators in a way that changes existing output.** Other videos' sounds come from the same module. After touching `sfx.mjs`, regenerate the other videos' sounds and `shasum`-compare them with the old files.
- **Each video gets its own sound script and folder:** `scripts/make-<video>-sounds.mjs` writes to `public/sfx-<video>/`. `writeSounds` clears its folder first, so a shared folder would delete another video's sounds.
- **The silent cut stays untouched.** The sound version is a second composition, `<Video>WithSound`, that renders `<Video />` plus a `<Video>SoundCues />` list. Never put `<Audio>` inside the picture components.
- **Hand-drawn notes are silent.** Only the component makes sounds. A pen sound on every note turns the video into a narration.

## Which sound for which change

```
Does the part travel across the frame, or resize?
├── Yes → movement(): air shaped by the move's own easing curve
└── No
    ├── Is it leaving? → plip falling (1250 → 720 Hz)
    ├── Is it arriving? → plip rising (720 → 1250 Hz)
    ├── Is text or a label changing in place? → tick: tap() at 1180–1500 Hz,
    │   rising one step per stage when the stages are a sequence
    ├── Is it a change of contrast in place (a dark plate dissolving)? → tick-low (tap at ~560 Hz)
    ├── Did a move just settle into its final place? → thock (170 Hz) at 92% of the move
    └── Did a task finish (import done)? → chime: a soft rising fifth (784 → 1175 Hz)
```

## Sizing movement sounds

`movement({ duration, easing, travelPx, largestPx, contrast, seed })`:

- `duration` and `easing` are the move's own, read from `timeline.ts`. Never retype them: when the timing changes, the sound follows on the next `npm run sounds:<video>`.
- `travelPx` is the distance on the 1080p frame (1x distance × the video's scale). `largestPx` is the biggest move in this video. Size = √(travel / largest) × contrast. Why √: loudness is perceived roughly logarithmically, so a linear map makes small moves inaudible and large ones harsh.
- `contrast` is 1 for dark, sharp edges (text, logos), ~0.6 for a light card edge on white, ~0.8 for mixed. A long move of a pale edge stays a light breath.
- Its loudness follows the move's speed. Start it at the move's nominal start; it is silent while the move is too small to see.

## Volumes

| Sound | Volume |
|---|---|
| movement (size baked into the file) | 0.32, always |
| plip for a large part leaving/arriving (a whole logo stack, a card) | 0.08–0.10 |
| plip for a small part | 0.05–0.07 |
| tick for a text/label swap | 0.035–0.05 |
| tick-low for a contrast change | 0.04–0.07 |
| thock on a settle | 0.08 |
| chime, the real finish | 0.10 |
| chime, an example or demo of the finish | 0.06 |

Examples of a state (a demo run of progress titles in the middle of the video) are always quieter than the real run at the end. Why: the real one is the payoff.

## Timing cues

- Cue fades at the frame they become visible, not their nominal start: `visibleAt(start, duration, easing, VISIBLE.fade)` from `src/motion.ts`. An eased fade is invisible for its first frames, and a sound that arrives before the picture feels early.
- Cue title swaps at `visibleAt(stage.at, TITLE_FADE, IN_OUT)` for each stage in the titles track.
- Two sounds for one change are offset by ≥0.06s, so they read as one gesture, not a click.

## Check the mix

After rendering, run `ffmpeg -i <file> -af volumedetect -vn -f null -`. Target max_volume around −17 dB and mean_volume between −48 and −43 dB, matching the earlier videos. If max is above −14 dB, a plip or chime is too loud; lower that cue's volume, never the movement volume (its size is in the file).
