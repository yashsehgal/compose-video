---
name: compose-sounds
description: Add subtle, well-timed sound effects to a Remotion component breakdown video, each one synthesized and sized to the layout or design change it plays under. Builds a separate "with sound" composition and leaves the silent one untouched. Use when asked to add sound, SFX or audio to a design demo or component video. Cue timing comes from compose-timing.
---

# Compose: sounds

## Initial Response

When this skill is first invoked without a specific request, respond only with:

> I'm ready to add sound to your video. Tell me which composition, and whether to keep the silent cut as it is (I always do).

Do not provide any other information until the user asks.

A sound skill. It does ONE thing: give a finished composition a `<Video>WithSound` twin with one soft sound under each visible change. It does not change the picture (that's `compose-animate`) or move beats (`compose-timing`).

## Operating Posture

Sound in a component demo is felt, not heard. Someone watching with sound on should feel the card settle and the parts leave; someone watching muted should miss nothing. When unsure whether a change needs a sound, it doesn't.

## Hard Rules

1. **Synthesize every sound** with `sfx.mjs` from a seeded source. Never download or record. Why: files are identical on every run, nothing needs a licence, and each sound is shaped by its motion's own curve.
2. **The silent cut stays untouched.** Sound lives in a second composition that renders `<Video />` and `<SoundCues />` side by side. Never put `<Audio>` inside picture components.
3. **One sound folder per video:** `public/sfx-<video>/`. `writeSounds` empties its folder first.
4. **Never change `sfx.mjs` output.** Every video's sounds come from it. After editing it, regenerate other videos' sounds and `shasum`-compare them with the old files.
5. **Notes are silent.** Only the component makes sound.
6. **Movement volume is fixed at 0.32.** A move's size is baked into its file; change the size, not the level.
7. **Examples are quieter than the real thing.** A state shown as an example mid-video plays at about 60% of the same sound at the real finish.

## The Sequence

### 1. Set up (first time in a project)

| Asset | Copy to |
| --- | --- |
| `assets/sfx.mjs` | `scripts/sfx.mjs` |
| `assets/make-sounds.template.mjs` | `scripts/make-<video>-sounds.mjs` |
| `assets/SoundCues.template.tsx` | `src/<video>/SoundCues.tsx` |

```json
"sounds:<video>": "node scripts/make-<video>-sounds.mjs",
"render:<video>:sound": "remotion render <Video>WithSound out/<video>-v<N>-4k-sound.mp4 --timeout=120000"
```

The generator imports `.ts` files directly: Node 23.6+, or 22.6+ with `--experimental-strip-types`.

### 2. List every visible change

Walk `timeline.ts` beat by beat. For each change, name the part, whether it moves, leaves, arrives or swaps, and its travel in 1x px.

### 3. Pick the sound

```
Does the part travel across the frame, or resize?
├── Yes → movement() shaped by the move's own easing
└── No
    ├── Leaving? → plip-out
    ├── Arriving? → plip-in
    ├── Text or a label swapping in place? → tick, one step higher per stage in a sequence
    ├── Contrast changing in place (a dark plate dissolving)? → tick-low
    ├── A move settling into its final place? → thock
    └── A task finishing? → chime
```

Frequencies, parameters and volumes for each are in [CATALOG.md](CATALOG.md).

### 4. Size the movements

In `make-<video>-sounds.mjs`, add one `move()` per movement:

- `duration` and `easing` come from `T` and `motion.ts`; never retype them.
- `travel` is in 1x px. The script multiplies it by `SCALE`.
- Set `LARGEST_MOVE` to the biggest travel in the video. Every other move is sized as √(travel / largest) × contrast.
- `contrast` is 1 for dark, sharp edges, ~0.6 for a pale card edge on white, ~0.8 for mixed.

### 5. Cue them

In `SoundCues.tsx`, add one cue per change, timed by `compose-timing`'s sync table, at the volume from [CATALOG.md](CATALOG.md).

### 6. Generate, render, check the mix

```bash
npm run sounds:<video>
npm run render:<video>:sound
ffmpeg -i out/<video>-v<N>-4k-sound.mp4 -af volumedetect -vn -f null - 2>&1 | grep -E 'mean_volume|max_volume'
```

| Reading | Target | If it's off |
| --- | --- | --- |
| max_volume | ≈ −17 dB | above −14 dB: lower the loudest plip or chime cue |
| mean_volume | −48 to −43 dB | below −50 dB: a step has no sound; above −40 dB: too many cues |

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| bare | Initial Response, then wait |
| a composition | Full sequence, steps 1–6 |
| "louder" / "quieter" | Move plip, tick and chime volumes within their [CATALOG.md](CATALOG.md) ranges; never the movement volume |
| "regenerate" | Step 6 only, after a retime |
