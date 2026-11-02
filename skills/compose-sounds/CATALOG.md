# Sound catalog

Every sound a compose video uses, with the generator call, when to use it and its volume. All generators come from `scripts/sfx.mjs`. Give every sound its own `seed`, so two sounds of the same kind don't sound identical.

| Name | Generator | Use it for | Volume |
| --- | --- | --- | --- |
| `move-*` | `movement({ duration, easing, travelPx, largestPx, contrast, seed })` | a part travelling or resizing | 0.32, always |
| `plip-out` | `plip(1250, 720, seed)` | a part leaving | large part 0.08–0.10, small part 0.05–0.07 |
| `plip-in` | `plip(720, 1250, seed)` | a part arriving | large part 0.08–0.10, small part 0.05–0.07 |
| `tick-1` … `tick-5` | `tap(1100 + 80 × n, seed)`, n = 1…5 (1180–1500 Hz) | text or a label swapping in place; rising one step per stage | 0.035–0.05 |
| `tick-low` | `tap(560, seed)` | contrast changing in place (a dark plate dissolving, a weight change) | 0.04–0.07 |
| `thock` | `thock(170, seed)` | a move settling into its final place | 0.08 |
| `chime` | `chime([784, 1175], seed)` | a task finishing (a rising fifth) | real finish 0.10, an example 0.06 |

## What each one sounds like

- **movement:** filtered air, like a sleeve brushing past at the same speed as the move. Its loudness follows the easing curve's speed, so it is silent while the move is too small to see, peaks where the move is fastest, and dies away as it settles. Its size and brightness come from √(travel / largest) × contrast.
- **plip:** a water drop, a quick pitch glide that rings off. Falling sounds like leaving; rising sounds like arriving.
- **tap / tick:** a small wooden tap, with a pitched body and the tiny click of contact, softened so it is felt more than heard.
- **thock:** a felt thock, low, round and short, for something landing.
- **chime:** soft glass partials struck one after another and kept dull, so it reads as a confirmation, not an alert.

## Movement contrast

| The moving edge is… | `contrast` |
| --- | --- |
| dark text, logos, a dark button | 1 |
| mixed (a light card with dark text inside) | 0.8 |
| a pale card edge or grey pill on white | 0.6 |
| a few px of padding | 0.8, with a small `travel` (it becomes a whisper) |

## Examples from shipped videos

| Change | Sound | Volume |
| --- | --- | --- |
| The card fades in with a 14px rise | `movement` 0.9s `SOFT`, travel 25 | 0.32 |
| The description fades, then its line closes 28px | `plip-out` at the fade, then `movement` 1.1s, travel 28, contrast 0.6 | 0.08 / 0.32 |
| Five progress titles crossfade | `tick-1` to `tick-5`, one per stage | 0.045 |
| A demo of "imported" mid-video | `chime` | 0.06 |
| A black button's plate dissolves into a plain label | `tick-low` | 0.07 |
| The button rises into the header and the card shrinks to one row | `movement` 1.2s, travel 45, then `thock` at 92% | 0.32 / 0.08 |
| Logo circles leave, the title slides 70px left, the badge arrives | `plip-out`, `movement` travel 70 (the largest move), `plip-in` | 0.09 / 0.32 / 0.10 |
| Padding grows by 4px | `movement` 1.1s, travel 4, contrast 0.8 | 0.32 |
| The real import finishes | `chime` | 0.10 |
| The card glides down to "After" | `movement` 1.3s, travel 96, contrast 0.8 | 0.32 |
