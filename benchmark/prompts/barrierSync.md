# Async Countdown Barrier
Create an async cyclic synchronization barrier in a single file without external libraries.

Requirements:
- Export class `AsyncBarrier`.
- Constructor accepts `parties: number`. If `parties <= 0`, throw `new Error("Parties must be positive")`.
- Maintain `count: number = parties`.
- Maintain `waiters: Array<() => void> = []`.
- Method `wait(): Promise<void>`: decrements `count`. If `count === 0`, reset `count = parties`, copy and clear `waiters`, resolve all waiters, and resolve immediately.
- If `count > 0`, return new Promise pushing resolve callback to `waiters`.
