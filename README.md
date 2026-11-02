# compose-video

Skills for turning a component's redesign into a short film.

You changed a component on your branch. These skills let your agent make a 4K video of that change. It shows the real component going from its old design to its new one, one change at a time. Each change gets a hand-drawn note, a soft sound plays under each move, and the video ends on a before/after comparison. Built on [Remotion](https://www.remotion.dev).

## Install

```bash
npx github:yashsehgal/compose-video
```

This installs all five skills into `~/.claude/skills/`. Start a new Claude Code session to pick them up.

> This repo is private. npx clones it with your own git credentials, so you need access to the repo and an SSH key on your GitHub account (check with `ssh -T git@github.com`). If the short form fails, use the full one: `npx git+ssh://git@github.com/yashsehgal/compose-video.git`.

| Option | Does |
| --- | --- |
| `--project` | installs into `./.claude/skills` for this project only |
| `--skill <name>` | installs only that skill; repeat it for more |
| `--force` | replaces skills you already have; use it to update |
| `--list` | lists the skills and installs nothing |

```bash
# Update to the latest version
npx github:yashsehgal/compose-video --force

# Only the audit skill, for this project
npx github:yashsehgal/compose-video --project --skill compose-audit
```

Without npx:

```bash
git clone git@github.com:yashsehgal/compose-video.git
cp -R compose-video/skills/* ~/.claude/skills/
```

## Why use it?

**Agents don't know what a good design demo looks like.**

Ask an agent for a video of a redesign and you get slides: a title card, "Step 1 of 6", a list of commits, then a component that jumps between states. The changes are hard to see and the notes vanish before you can read them.

These skills encode the decisions behind a demo people actually watch:

- **Show, don't explain:** only the component is on screen.
- **No layout shift:** every part is one persistent element, and text is measured before the first frame.
- **One motion language:** parts leave over 0.75s, easing in and out with a blur, and arrive over 0.6s, easing out. There are no springs.
- **Readable notes:** each note stays up at least 3 seconds after it finishes writing.
- **The product's own words:** copy and tokens are read from the source on both git refs.
- **Sound sized to the change:** a 4px padding nudge is a whisper; a card collapsing is a full breath.

Each rule comes from a real review of a real video.

## Reference

- **[compose-animate](./skills/compose-animate/SKILL.md):** builds the video. It reads the component on both refs, picks 5–6 changes, morphs one into the other without layout shift, writes the notes and closes on before/after. Includes [SETUP.md](./skills/compose-animate/SETUP.md) and [RECIPES.md](./skills/compose-animate/RECIPES.md).
- **[compose-timing](./skills/compose-timing/SKILL.md):** paces the video and keeps it in sync. It owns the timeline, so motion, notes and sounds stay on one clock, and it fixes notes that leave too soon and sounds that land early.
- **[compose-sounds](./skills/compose-sounds/SKILL.md):** adds a "with sound" cut. Every sound is synthesized, shaped by its move's easing and sized by how far and how visibly the part travels. Includes [CATALOG.md](./skills/compose-sounds/CATALOG.md).
- **[compose-cleanup](./skills/compose-cleanup/SKILL.md):** takes a step, scene or label out cleanly, leaving no stray state, note, sound or gap. It also tidies stills and old renders.
- **[compose-audit](./skills/compose-audit/SKILL.md):** reviews a render against ten strict standards using a contact sheet of stills, ends with a Ship or Block verdict, and names which skill fixes each finding. Includes [STANDARDS.md](./skills/compose-audit/STANDARDS.md).

## Running it

### Requirements

| Tool | Version | Why |
| --- | --- | --- |
| Claude Code | latest | runs the skills |
| Node.js | 23.6+ (or 22.6+ with `--experimental-strip-types`) | the sound generator imports `.ts` files directly |
| Remotion | v4, with `@remotion/google-fonts` and `@remotion/paths` | renders the video |
| ffmpeg, ffprobe | any recent version | contact sheets, resolution and audio checks |
| git | — | the component's old and new designs on two refs |

### First video, step by step

1. **Open your Remotion project** in Claude Code, or start a new one with `npx create-video@latest`.
2. **Ask for the video.** Name the component and the two refs:
   ```
   Make a breakdown video of src/components/ImportCard.tsx, origin/dev vs this branch.
   ```
   `compose-animate` copies its shared code into `src/compose/`, reads the component on both refs and lists the changes it picked. Then it builds the composition.
3. **It paces and checks itself.** `compose-timing` lays out the beats and `compose-audit` reviews a contact sheet before you see the video.
4. **Watch it**, either in `npx remotion studio` or as the render in `out/<video>-v1-4k.mp4`.
5. **Give feedback in plain words.** The right skill picks it up (see the examples below).
6. **Add sound** once the picture is right:
   ```
   Make a version with sound. Keep the silent one as it is.
   ```

### What gets added to your project

```
remotion.config.ts            4K, near-lossless H.264
src/compose/                  shared by every video
  motion.ts                   SOFT / IN_OUT curves, progress(), mix(), visibleAt()
  fade.ts                     the one arrive/leave style
  fonts.ts                    variable Inter + the notes' hand
  useTextWidths.ts            string widths before frame 0
  sketch/                     HandNote, Callout, SketchStroke, shapes, ink
src/<video>/                  one folder per video
  timeline.ts state.ts layout.ts tokens.ts <Component>.tsx notes/ SoundCues.tsx
scripts/
  sfx.mjs                     sound generators + WAV writer
  make-<video>-sounds.mjs     this video's sounds
  stills.sh                   contact sheets
public/sfx-<video>/           this video's generated sounds
out/                          renders: <video>-v<N>-4k.mp4, <video>-v<N>-4k-sound.mp4
```

## Examples

| You say | Skill | What happens |
| --- | --- | --- |
| "Make a breakdown video of the import card, dev vs this branch" | compose-animate | Reads both refs, lists 5–6 changes, builds the composition, renders v1 |
| "Just plan it first" | compose-animate `plan` | Lists the changes and their order; writes no code |
| "The notes disappear too fast" | compose-timing | Holds each note ≥3s once written, shifts later beats, regenerates the sounds |
| "The badge sound comes in early" | compose-timing | Re-cues it at the fade's first visible frame |
| "Make a version with sound" | compose-sounds | Adds `<Video>WithSound` and the sounds; the silent cut is untouched |
| "Drop the step where Review is removed, it's tedious" | compose-cleanup | Removes the step everywhere, folds its exits into the next step, closes the gap |
| "Remove the titles at the top" | compose-cleanup `simplify` | Cuts every heading, counter and subtitle |
| "Change 1,200 accounts to 10k" | compose-animate | Updates every string that shows the count, then re-renders |
| "Check it before I share it" | compose-audit | Contact sheet, fidelity spot-check, 4K and level checks, findings table, Ship or Block |
| "Keep this version, make a new one with smoother exits" | compose-animate | Renders to `v2`; v1 files are never touched |

### A sample audit

```
| At    | Standard           | Finding                                     | Fix                          | Owner           |
| ----- | ------------------ | ------------------------------------------- | ---------------------------- | --------------- |
| 21.8s | 6 Readable notes   | Note written at 21.4s, erased at 21.6s      | Erase ≥24.4s, shift later    | compose-timing  |
| 38.6s | 3 No shift         | Badge jumps 6px when the title changes      | Follow measured widths       | compose-animate |

Checked: 14 stills, 6 fidelity samples, 3840×2160 60fps 65.0s, −16.8 / −46.3 dB
Unchecked: full playback

Verdict: Block (Standards 3, 6)
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Timeout (30000ms) exceeded … Fetching … font` | Render with `--timeout=120000`. Google Fonts can be slow headlessly. |
| `Cannot use frame N … highest frame is N-1` | The last frame is `DURATION_S × fps − 1`. |
| The sound script fails on `import … .ts` | Use Node 23.6+, or run it with `node --experimental-strip-types`. |
| Another video lost its sounds | Each video needs its own `public/sfx-<video>/`. `writeSounds` empties its folder first. |
| A badge jumps when the title changes | Place it from measured title widths mixed by the crossfade (RECIPES.md § Text that other parts follow). |
| A note wobbles while the card moves | Place notes from the layout at the note's start time, not the current frame. |

## Contributing to the skills

The skills follow [How to write good skills](https://aiforui.dev/learn/how-to-write-good-skills):
- Rules are strict and give their numbers.
- Every rule says why.
- Each skill does one thing.
- Decisions are written as trees and tables.
- Every line changes what the agent does.

Each `SKILL.md` has the same sections:
- **Initial Response**
- **Scope**, naming the sibling skill for everything else
- **Operating Posture**
- **Hard Rules**
- **The Sequence**
- **Invocation Variants**

Precise values and long examples live in an uppercase file next to it: `SETUP.md`, `RECIPES.md`, `CATALOG.md` or `STANDARDS.md`.
