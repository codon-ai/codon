# Concurrent Promise Pool
Create a concurrency-limited async task pool processor in a single file.

Requirements:
- Export async function `promisePool<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]>`.
- Create output array `results: R[] = new Array(items.length)`.
- Maintain `nextIndex = 0`.
- Worker loop `dispatch()`: while `nextIndex < items.length`, grab current index `i = nextIndex++`, execute `results[i] = await worker(items[i], i)`.
- Spawn `concurrency` parallel worker loops: `const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => dispatch())`.
- Wait for `Promise.all(runners)`.
- Return `results` in original item order.
