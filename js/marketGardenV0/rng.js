/**
 * Market Garden V0 - Seeded Random Number Generator
 * Uses mulberry32 for fast, deterministic randomness
 * All game randomness must use this for reproducibility
 */

function createRng(seed) {
  return function() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min)) + min;
}

function randomChoice(rng, arr) {
  return arr[randomInt(rng, 0, arr.length)];
}

function randomChoiceUnique(rng, arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = randomInt(rng, 0, copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function rollChance(rng, chance) {
  return rng() < chance;
}
