# Cancellable Async Token and Delay
Create a cancellation token pattern for aborting async tasks in a single file.

Requirements:
- Export class `CancellationToken`: property `isCancelled: boolean = false`, property `listeners: Array<() => void> = []`.
- Method `cancel(): void`: sets `isCancelled = true` and invokes all registered listeners.
- Method `onCancel(cb: () => void): () => void`: registers callback and returns unregister function. If already cancelled, invokes callback immediately.
- Export function `cancellableDelay(ms: number, token: CancellationToken): Promise<void>`.
- Returns `new Promise<void>((resolve, reject) => { ... })`. Sets `setTimeout` for `ms`. Registers listener with `token.onCancel` that clears timeout and calls `reject(new Error("Operation cancelled"))`.
