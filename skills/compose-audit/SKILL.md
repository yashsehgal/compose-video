---
name: compose-audit
description: Audit a rendered Remotion component breakdown video against a strict bar before it is shared - a contact sheet of stills at every beat, layout stability, note readability, fidelity to the real component's tokens and copy, 4K output and audio levels. Default to flagging; approval is earned. Use after building or changing a composition, or when asked to review, check, QA or audit a demo video.
---

# Compose: audit

## Initial Response

When this skill is first invoked without a specific request, respond only with:

> I'm ready to audit your video against a strict bar. Tell me the composition (and the render file, if there is one).

Do not provide any other information until the user asks.

A review skill. It does ONE thing: look at a video's frames and output and decide whether it can be shared. It does not fix what it finds (that's `compose-animate`, `compose-timing` or `compose-cleanup`, by finding type).

## Operating Posture

You are reviewing a film someone will share with their team. A cut that "renders" but has a note that vanishes before it can be read, a badge that hops, or a label the product never says is a regression, not a pass. Default to flagging. Approval is earned.

Judge from frames, never from code alone. When something can only be judged in playback (a crossfade's feel, a sound's weight), say so and list it as unchecked instead of guessing.

## The Ten Standards

Every video is measured against these. A violation is a finding. Precise values are in [STANDARDS.md](STANDARDS.md).

1. **Component only.** Nothing on screen but the component and hand-drawn notes.
2. **Stage.** The component covers ~85% of the frame width, centred, at one width throughout.
3. **No shift.** Nothing moves between neighbouring stills unless a step moved it. Text followers keep their gap.
4. **Soft exits.** Mid-exit frames show a blurred dissolve at scale ≥0.97, never a clipped or vanished part.
5. **No overshoot.** Nothing passes its final place.
6. **Readable notes.** Each note is held ≥3s once written and gone ≥0.8s before the next change.
7. **Accurate notes.** Arrows land on what they name, no note covers the component or leaves the frame, and wording matches the user's.
8. **Fidelity.** Tokens, copy, icons and numbers match the source component, or the user's data.
9. **Like-for-like close.** Old above new, same state, labelled only "Before" and "After".
10. **Output.** 3840×2160, 60fps, the timeline's duration. Sound cuts sit at the mix targets, and kept versions are untouched.

## Escalation Triggers

Flag these on sight, as Block:

- Any heading, step counter or subtitle on screen
- The component's width differs between two stills
- A part present in one still and absent in the next with no mid-exit frame between them
- A note fully written for <3s, or still on screen when the next change starts
- A label, title or number that isn't in the source and wasn't given by the user
- An output below 3840×2160
- A kept version's file missing or newer than when it was kept
- A sound cut with max_volume above −14 dB

## The Sequence

### 1. Contact sheet

Copy `assets/stills.sh` to the project's `scripts/` once. For every step, pick:
- the frame before the change
- the middle of each exit
- the frame the note is fully written
- the frame before the note erases

Add the first and last frames (the last is `DURATION_S − 1/fps`).

```bash
bash scripts/stills.sh <Composition> 60 <seconds...>
```

Read `out/stills/<Composition>/grid.png`. Neighbouring stills side by side are how shifts show.

### 2. Fidelity spot-check

Pick three tokens from `tokens.ts` and three on-screen strings, and find each in the source on the right ref:

```bash
git show <ref>:<component file> | grep -n "<string>"
```

### 3. Output

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of csv=p=0 <file>
ffmpeg -i <sound file> -af volumedetect -vn -f null - 2>&1 | grep -E 'mean_volume|max_volume'
ls -la out/
```

## Required Output Format

### Part 1: findings table (required)

One row per issue, ordered by time:

| At | Standard | Finding | Fix | Owner |
| --- | --- | --- | --- | --- |
| 21.8s | 6 Readable notes | "one slot on the right" is written at 21.4s and erased at 21.6s | Erase at ≥24.4s; shift later beats | compose-timing |
| 38.6s | 3 No shift | The badge jumps 6px when the title changes | Place it from measured widths mixed by the crossfade | compose-animate |

### Part 2: checked and unchecked (required)

Two short lists:
- **Checked:** stills at N beats, fidelity of six samples, resolution, levels.
- **Unchecked:** full playback, how the sound feels in practice.

### Part 3: verdict (required)

- **Block:** any escalation trigger, or any finding against Standards 1, 3, 6 or 10.
- **Ship:** no Block findings, and every remaining finding is marked as polish.

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| bare | Initial Response, then wait |
| a composition | Full sequence, steps 1–3, plus the required output |
| `quick` | Contact sheet of the first frame, each note fully written, and the last frame; Standards 1, 6 and 10 only |
| `output <file>` | Step 3 only |
| `seam <second>` | Stills at ±1.5s around one point, after a cut or retime |
