export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export async function delayRnd(minSec: number, maxSec: number) {
  const delaySeconds = getRandomArbitrary(minSec * 1000, maxSec * 1000);
  return new Promise((resolve) => {
    setTimeout(resolve, delaySeconds);
  });
}

export function delay(ms = 10_000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(0), ms);
  });
}
