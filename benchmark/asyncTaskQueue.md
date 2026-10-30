# Async Task Queue
Create a concurrency-limited task runner in a single file using native Promises without external libraries.

Requirements:
- Export a class `AsyncTaskQueue`.
- Constructor accepts `concurrency: number`.
- Internal state: `queue: Array<() => void>` and `activeCount: number` initialized to 0.
- Method `add<T>(task: () => Promise<T>): Promise<T>`:
  - Returns a Promise that executes `task` once active tasks are below `concurrency`.
  - Increments `activeCount` when task begins.
  - Resolves or rejects with the task's result.
  - In a `finally` block: decrements `activeCount`, pops the next queued item, and executes it.
- Getter `pending: number` returning `queue.length`.
- At the bottom, instantiate with concurrency 2, dispatch 4 async tasks with 50ms delays returning `"Task <id> done"`, and log `Promise.all` results.
