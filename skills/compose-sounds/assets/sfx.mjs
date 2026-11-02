// The sound effects' building blocks, shared by every video's sound script:
// a seeded noise source, simple filters, the generators and a WAV writer.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const RATE = 48_000;

/** Mulberry32: a small seeded PRNG, so noise is the same every run. */
export const seeded = seed => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const buffer = seconds => new Float32Array(Math.round(seconds * RATE));

/** One-pole low-pass, in place; `cutoff` may vary per sample. */
export const lowpass = (samples, cutoff) => {
  let y = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const fc = typeof cutoff === "function" ? cutoff(i / RATE) : cutoff;
    const a = 1 - Math.exp((-2 * Math.PI * fc) / RATE);
    y += a * (samples[i] - y);
    samples[i] = y;
  }
  return samples;
};

export const highpass = (samples, cutoff) => {
  const low = lowpass(Float32Array.from(samples), cutoff);
  for (let i = 0; i < samples.length; i += 1) samples[i] -= low[i];
  return samples;
};

/** Scale to a peak, with short fades so nothing clicks at the ends. */
export const finish = (samples, peak = 0.5) => {
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  const gain = max > 0 ? peak / max : 0;
  const fade = Math.round(0.003 * RATE);
  for (let i = 0; i < samples.length; i += 1) {
    const edge = Math.min(1, i / fade, (samples.length - 1 - i) / fade);
    samples[i] *= gain * edge;
  }
  return samples;
};

/**
 * A small wooden tap: a pitched body that drops a little as it rings, plus
 * the tiny click of contact. Softened with a low-pass so it is felt more
 * than heard.
 */
export const tap = (freq, seed) => {
  const out = buffer(0.22);
  const random = seeded(seed);
  let phase = 0;
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    const f = freq * (0.82 + 0.18 * Math.exp(-t / 0.012));
    phase += (2 * Math.PI * f) / RATE;
    const body = Math.sin(phase) * Math.exp(-t / 0.045);
    const overtone = Math.sin(phase * 2.71) * 0.18 * Math.exp(-t / 0.018);
    const click = (random() * 2 - 1) * 0.35 * Math.exp(-t / 0.0025);
    out[i] = body + overtone + click;
  }
  return finish(lowpass(out, 3200), 0.5);
};

/**
 * A breath of air shaped by the movement it plays under, like a sleeve
 * brushing past at the same speed.
 *
 * - Its loudness follows the move's own speed, from the easing curve: it
 *   rises as the move gets going, peaks where it is fastest and dies away
 *   as it settles. Started with the move, it is quiet exactly while the
 *   move is too small to see.
 * - Its size and brightness follow how much the move shows: the square
 *   root of the distance against the video's largest move (`largestPx`),
 *   times its contrast.
 *   Dark logos sliding on white read at full strength; the pill's light
 *   grey edge reads at half, so its long wrap stays a light breath.
 * - It lasts as long as the move, plus a short tail.
 */
export const movement = ({
  duration,
  easing,
  travelPx,
  largestPx,
  contrast = 1,
  seed,
}) => {
  const tail = 0.2;
  const out = buffer(duration + tail);
  const random = seeded(seed);
  for (let i = 0; i < out.length; i += 1) out[i] = random() * 2 - 1;

  // Speed along the curve, normalised to its fastest point.
  const step = 1 / 2000;
  const speed = u =>
    u >= 1 ? 0 : (easing(Math.min(1, u + step)) - easing(u)) / step;
  let fastest = 0;
  for (let u = 0; u < 1; u += step) fastest = Math.max(fastest, speed(u));
  const envelope = t => {
    if (t < duration) return (speed(t / duration) / fastest) ** 0.9;
    // A short release after the move ends, from wherever it got to.
    return (speed(1 - step) / fastest) ** 0.9 * Math.exp(-(t - duration) / 0.05);
  };

  const size = Math.min(1, Math.sqrt(travelPx / largestPx)) * contrast;
  lowpass(out, t => 180 + 1500 * size * envelope(t));
  lowpass(out, 1600);
  highpass(out, 80);
  for (let i = 0; i < out.length; i += 1) out[i] *= envelope(i / RATE);
  return finish(out, 0.45 * size);
};

/**
 * A water drop: a quick pitch glide that rings off. Falling for something
 * leaving, rising for something arriving.
 */
export const plip = (from, to, seed) => {
  const out = buffer(0.2);
  const random = seeded(seed);
  let phase = 0;
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    const glide = 1 - Math.exp(-t / 0.018);
    const f = from + (to - from) * glide;
    phase += (2 * Math.PI * f) / RATE;
    const ring = Math.sin(phase) * Math.exp(-t / 0.05) * Math.min(1, t / 0.002);
    out[i] = ring + (random() * 2 - 1) * 0.04 * Math.exp(-t / 0.004);
  }
  return finish(lowpass(out, 4200), 0.45);
};

/** A felt thock: low, round and short, for something settling into place. */
export const thock = (freq, seed) => {
  const out = buffer(0.3);
  const random = seeded(seed);
  let phase = 0;
  for (let i = 0; i < out.length; i += 1) {
    const t = i / RATE;
    const f = freq * (0.75 + 0.25 * Math.exp(-t / 0.02));
    phase += (2 * Math.PI * f) / RATE;
    const body = Math.sin(phase) * Math.exp(-t / 0.07);
    const felt = (random() * 2 - 1) * 0.25 * Math.exp(-t / 0.008);
    out[i] = body + felt;
  }
  return finish(lowpass(out, 1100), 0.55);
};

/**
 * A soft glass chime: sine partials struck one after another, each ringing
 * off slowly, for something that has finished. Kept dull with a low-pass so
 * it reads as a confirmation, not an alert.
 */
export const chime = (freqs, seed, gap = 0.07) => {
  const out = buffer(0.9 + gap * freqs.length);
  const random = seeded(seed);
  freqs.forEach((freq, n) => {
    const start = Math.round(n * gap * RATE);
    let phase = 0;
    for (let i = start; i < out.length; i += 1) {
      const t = (i - start) / RATE;
      phase += (2 * Math.PI * freq) / RATE;
      const ring =
        (Math.sin(phase) + 0.12 * Math.sin(phase * 2.0)) *
        Math.exp(-t / 0.32) *
        Math.min(1, t / 0.004);
      out[i] += ring + (random() * 2 - 1) * 0.02 * Math.exp(-t / 0.003);
    }
  });
  return finish(lowpass(out, 3600), 0.42);
};

/** Mono samples as a 16-bit stereo WAV. */
export const wav = samples => {
  const data = Buffer.alloc(samples.length * 4);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s)) * 0x7fff;
    data.writeInt16LE(v | 0, i * 4);
    data.writeInt16LE(v | 0, i * 4 + 2);
  });
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
};

/** Writes `sounds` as WAVs into `dir`, cleared first so nothing stale lingers. */
export const writeSounds = (dir, sounds) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [name, samples] of Object.entries(sounds)) {
    writeFileSync(join(dir, `${name}.wav`), wav(samples));
  }
  console.log(`Wrote ${Object.keys(sounds).length} sounds to ${dir}`);
};
