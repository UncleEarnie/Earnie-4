/**
 * Earnie's Journey V2 - RNG (same as V1, so reusable)
 */

function createRng(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function rollChance(rng, probability) {
  return rng() < probability;
}

function randomChoice(rng, array) {
  if (!array || array.length === 0) return null;
  const index = Math.floor(rng() * array.length);
  return array[index];
}

function randomChoiceWeighted(rng, items, weights) {
  if (!items || items.length === 0) return null;
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[items.length - 1];
}
