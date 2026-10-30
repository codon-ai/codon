export async function promisePool(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function dispatch() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i], i);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => dispatch());
  await Promise.all(runners);
  return results;
}
