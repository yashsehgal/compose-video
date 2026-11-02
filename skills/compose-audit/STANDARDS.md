# Audit standards reference

The exact values behind the ten standards. Cite these in findings instead of approximating.

## Stage

| Value | Target |
| --- | --- |
| Composition | 1920×1080, 60fps, `Config.setScale(2)` |
| Output | 3840×2160 H.264, `yuv420p`, bt709 |
| Component width on frame | ~85% of 1920 px (e.g. 680px × 2.4 = 1632 px) |
| Component position | centred; `top = cy − height × scale / 2` |
| On screen | the component, hand-drawn notes, and "Before"/"After" in the close |

## Motion

| Part | Duration | Curve |
| --- | --- | --- |
| Leaving | 0.75s | ease-in-out (`IN_OUT`, `cubic-bezier(0.645, 0.045, 0.355, 1)`) |
| Arriving | 0.6s | ease-out (`SOFT`, `cubic-bezier(0.22, 1, 0.36, 1)`) |
| Swapping in place | 0.6s | ease-in-out |
| Moving or resizing | 1.0–1.3s | ease-in-out |
| Weight change | 1.2s | ease-in-out, on a variable font |
| Constant | — | linear |

| Exit end state | Value |
| --- | --- |
| Opacity | 0 |
| Blur | 2.5px at 1x |
| Scale | 0.97, never lower |

A space that closes after a part fades starts 0.25s after the fade starts.

## Pacing

| Beat | Target |
| --- | --- |
| Opening hold on the old design | ~2.5s |
| Step length | 7–8s |
| Note starts | ~1.2s after its change starts |
| Writing speed | 0.045s per character, min 0.5s |
| Hold once written | ≥3s |
| Gap before the next change | ≥0.8s |
| Progress title stage | ~1.4s |
| Final hold | ≥5s |
| Changes per video | 5–6 |
| Note length | ≤8 words |

## Notes

| Value | Target |
| --- | --- |
| Font | Gloria Hallelujah |
| Ink | `#E8553F` |
| Note size | 36px (labels in the close ~46px) |
| Lean | −2.5° |

## Sound

| Reading | Target |
| --- | --- |
| max_volume | ≈ −17 dB, Block above −14 dB |
| mean_volume | −48 to −43 dB |
| Movement cue volume | 0.32 |
| Notes | silent |

## Files

| Rule | Check |
| --- | --- |
| Kept versions untouched | `ls -la out/`: timestamp unchanged |
| Version naming | `<video>-v<N>-4k.mp4`, `<video>-v<N>-4k-sound.mp4` |
| Silent cut exists alongside the sound cut | both files present |
