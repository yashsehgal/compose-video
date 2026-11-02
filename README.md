# compose-video

Five Claude Code skills for making **component breakdown videos** with [Remotion](https://www.remotion.dev): one real UI component, walked from its old design to its new one, a change at a time. Hand-drawn notes explain each change, synthesized sound sits under each move, and the video ends on a before/after comparison.

Each skill handles one stage, so the agent loads only the rules it needs:

| Skill | Stage | Use it when you want to… |
|---|---|---|
| [`compose-animate`](skills/compose-animate/SKILL.md) | Picture | build the video: the component, its morphs, the notes and the before/after close |
| [`compose-timing`](skills/compose-timing/SKILL.md) | Pacing and sync | set up the timeline, retime beats, keep notes readable, line sounds up with frames |
| [`compose-sounds`](skills/compose-sounds/SKILL.md) | Sound | add a "with sound" cut, with effects sized to each change |
| [`compose-cleanup`](skills/compose-cleanup/SKILL.md) | Cutting | remove a step, scene or label cleanly, and tidy the project afterwards |
| [`compose-audit`](skills/compose-audit/SKILL.md) | Review | check a render: contact sheets, layout stability, fidelity, 4K, audio levels |

## What you get

- **The component, nothing else.** No title cards or step counters: just the component, centred and wide, morphing in place.
- **No layout shift.** Every part is one persistent element placed by a pure function of the frame, and text is measured before the first frame, so nothing jumps.
- **One motion language.** Parts leave over 0.75s, easing in and out with a blur and a slight shrink. They arrive over 0.6s, easing out. Moves take 1.0–1.3s. No springs.
- **Readable notes.** Notes are written in marker by hand, and each one stays up at least 3s after it finishes writing.
- **Real copy.** Labels, status text and tokens come from the component's source on both git refs.
- **Sound that matches the picture.** Every effect is synthesized from a seeded source, shaped by the easing of its move, and sized by how far and how visibly the part travels.
- **4K output.** Frames are laid out at 1920×1080 and rendered at 3840×2160, 60fps.

## Requirements

- [Claude Code](https://claude.com/claude-code)
- Node.js 23.6 or later (the sound generator imports `.ts` files directly; on Node 22.6+ add `--experimental-strip-types`)
- A Remotion v4 project with `remotion`, `@remotion/cli`, `@remotion/google-fonts` and `@remotion/paths`
- `ffmpeg` and `ffprobe` on your `PATH` (for contact sheets and audio checks)
- Git, with the component's old and new designs on two refs (for example `origin/dev` and your branch)

## Setup

### 1. Install the skills

For all your projects:

```bash
git clone git@github.com:yashsehgal/compose-video.git
```

```bash
cp -R compose-video/skills/* ~/.claude/skills/
```

For one project only, copy them into that project's `.claude/skills/` instead. Restart Claude Code, or start a new session, to pick them up.

### 2. Start a Remotion project (if you don't have one)

```bash
npx create-video@latest
```

```bash
npm i @remotion/google-fonts @remotion/paths
```

### 3. Let the skills copy their assets

The first time you ask for a video, `compose-animate` copies its shared code into the project, and `compose-sounds` does the same for sound:

```
remotion.config.ts            4K, near-lossless H.264
src/compose/motion.ts         easing curves, progress(), mix(), visibleAt()
src/compose/fade.ts           the one arrive/leave style
src/compose/fonts.ts          variable Inter + the notes' hand
src/compose/useTextWidths.ts  measures strings before frame 0
src/compose/sketch/           HandNote, Callout, SketchStroke, shapes, ink
scripts/sfx.mjs               sound generators + WAV writer
scripts/stills.sh             contact sheets for review
```

Every video in the project shares these files. Each video then gets its own `src/<video>/` folder and `public/sfx-<video>/` sound folder.

## Use cases

- **Design review:** show a team what changed in a component on your branch and why, without anyone checking out the code.
- **PR or changelog video:** attach a 60-second before/after walkthrough to a pull request or release note.
- **Design system updates:** walk a component through new tokens (weights, spacing, radii) one at a time.
- **Explaining a pattern:** show the steps that took a component from cluttered to clean, such as fewer controls, one row or a calmer type scale.

## How to use

Ask in plain words; the right skill loads from its description.

```
Make a breakdown video of the AccountCreationPreviewCard: dev vs this branch.
```

```
The notes disappear too fast, keep each one up longer.
```

```
Make a version with sound. Keep the silent one as it is.
```

```
Drop the step where the Review button is removed, it's tedious.
```

```
Check the latest render before I share it.
```

A typical run:

1. **compose-animate** reads the component on both refs, picks 5–6 visible changes and builds the composition.
2. **compose-timing** paces it: about 7–8s per step, with every note held at least 3s.
3. **compose-audit** renders a contact sheet and checks it before you see anything.
4. You give feedback. **compose-cleanup** removes what you cut, **compose-timing** retimes it, and **compose-animate** changes the rest.
5. **compose-sounds** adds the sound cut, and **compose-audit** checks the levels and the 4K output.

## Guidelines

Every skill enforces these rules:

- **Only the component on screen.** Headings, counters and process scenes pull the eye off it.
- **5–6 changes at most.** Removing a minor control is never a step of its own; it folds into a neighbouring step.
- **Real copy and tokens.** Strings and values come from the source. Your own data, such as "10k accounts", is used everywhere you ask.
- **Notes are readable.** At most 8 words, written about 1.2s after the change starts, held at least 3s, and erased about 1s before the next change.
- **Exits dissolve.** They ease in and out over 0.75s with a blur and a slight shrink, and are never cut.
- **One timeline.** The picture, notes and sounds all read one `timeline.ts`, in seconds.
- **Keep the versions you asked for.** Renders are named `<video>-v<N>-4k.mp4`, and a kept version is never overwritten.
- **Show the proof.** Checks happen on stills and with `ffprobe`. The agent tells you what it did and didn't watch.

## Repository layout

```
skills/
  compose-animate/   SKILL.md, assets/ (motion, fade, fonts, text widths, sketch, config)
  compose-timing/    SKILL.md, assets/timeline.template.ts
  compose-sounds/    SKILL.md, assets/ (sfx.mjs, sound script and cue templates)
  compose-cleanup/   SKILL.md
  compose-audit/     SKILL.md, assets/stills.sh
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Timeout (30000ms) exceeded … Fetching … font` | Render with `--timeout=120000`. Google Fonts can be slow headlessly. |
| `Cannot use frame N … highest frame is N-1` | The last frame is `DURATION_S × fps − 1`. |
| Sound script fails on `import … .ts` | Use Node 23.6+, or run it with `node --experimental-strip-types`. |
| Another video lost its sounds | Each video needs its own `public/sfx-<video>/`. `writeSounds` empties its folder first. |
| A badge jumps when the title changes | Place it from the measured title widths mixed by the crossfade, not from the DOM. |

## Writing and changing the skills

The skills follow the structure taught in [How to write good skills](https://aiforui.dev/learn/how-to-write-good-skills):
- Each skill is strict and states its numbers.
- Each skill explains why its rules exist.
- Each skill has one focus.
- Decisions are written as trees.
- Every line changes what the agent does.

Keep it that way when editing:
- Replace soft words ("reasonable", "tasteful") with numbers.
- Give every rule its reason.
- Put a new stage in its own skill rather than growing an existing one.
