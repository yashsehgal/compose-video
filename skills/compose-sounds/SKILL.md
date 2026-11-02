---
name: compose-sounds
description: Add subtle, well-timed sound effects to a Remotion component breakdown video, each sized to the layout or design change it plays under. Use when asked to add sound, SFX or audio to a design demo or component video, or to make a "with sound" version. Synthesizes every sound; nothing is downloaded. Cue timing rules live in compose-timing.
---

# Compose: sounds

Sound in a component demo is felt, not heard. Every sound sits under one visible change and is as loud as that change is large.

## Set up

| Asset | Copy to |
|---|---|
| `assets/sfx.mjs` | `scripts/sfx.mjs` (shared by every video) |
| `assets/make-sounds.template.mjs` | `scripts/make-<video>-sounds.mjs` |
| `assets/SoundCues.template.tsx` | `src/<video>/SoundCues.tsx` |

Add a script: `"sounds:<video>": "node scripts/make-<video>-sounds.mjs"`. The generator imports `.ts` directly, so it needs Node 23.6+ (or 22.6+ with `--experimental-strip-types`).

## Rules

- **Synthesize every sound with `sfx.mjs`**, from a seeded random source. Why: the files are identical on every run, nothing needs a licence, and a sound is shaped by the same easing curve as its motion.
- **Never change `sfx.mjs` in a way that changes existing output.** Every video's sounds come from it. After editing it, regenerate the other videos' sounds and `shasum`-compare them with the old files.
- **Each video gets its own folder**, `public/sfx-<video>/`. `writeSounds` empties its folder first, so a shared folder deletes another video's sounds.
- **The silent cut stays as it is.** The sound version is a second composition, `<Video>WithSound`, that renders `<Video />` and `<SoundCues />` side by side. Never put `<Audio>` inside picture components.
- **Hand-drawn notes are silent.** Only the component makes sound. A pen sound on every note turns the video into narration.

## Which sound for which change

```
Does the part travel across the frame, or resize?
├── Yes → movement(): air shaped by the move's own easing
└── No
    ├── Leaving? → plip-out (falling 1250 → 720 Hz)
    ├── Arriving? → plip-in (rising 720 → 1250 Hz)
    ├── Text or a label swapping in place? → tick (tap 1180–1500 Hz),
    │   one step higher per stage in a sequence
    ├── Contrast changing in place (a dark plate dissolving)? → tick-low (tap 560 Hz)
    ├── A move settling into its final place? → thock (170 Hz)
    └── A task finishing? → chime (a soft rising fifth, 784 → 1175 Hz)
```

## Sizing movement sounds

`movement({ duration, easing, travelPx, largestPx, contrast, seed })`:

- `duration` and `easing` come from the video's `timeline.ts` and `motion.ts`. Never retype them.
- `travelPx` is the distance on the 1080p frame (1x distance × scale). `largestPx` is the biggest move in this video. Size = √(travel / largest) × contrast. Why √: loudness is perceived roughly logarithmically, so a linear map makes small moves inaudible and big ones harsh.
- `contrast`: 1 for dark, sharp edges (text, logos); ~0.6 for a pale card edge on white; ~0.8 for mixed.
- Give each sound a unique `seed`, so two moves of the same size don't sound identical.

## Volumes

| Sound | Volume |
|---|---|
| movement (size is baked into the file) | 0.32, always |
| plip, large part (a logo stack, a card) | 0.08–0.10 |
| plip, small part | 0.05–0.07 |
| tick, text or label swap | 0.035–0.05 |
| tick-low, contrast change | 0.04–0.07 |
| thock, settle | 0.08 |
| chime, the real finish | 0.10 |
| chime, an example of the finish mid-video | 0.06 |

Examples of a state shown mid-video are always quieter than the real run at the end. Why: the real one is the payoff.

## Check the mix

```bash
ffmpeg -i out/<video>-v<N>-4k-sound.mp4 -af volumedetect -vn -f null - 2>&1 | grep -E 'mean_volume|max_volume'
```

Target max_volume ≈ −17 dB and mean_volume between −48 and −43 dB. If max is above −14 dB, lower the loudest plip or chime cue. Never raise or lower `MOVEMENT_VOLUME`: each movement's size is in its file, and changing the shared level unbalances them all.
