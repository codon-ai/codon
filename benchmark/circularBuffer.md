# Circular Ring Buffer
Create a fixed-capacity FIFO Circular Buffer in a single file without external libraries.

Requirements:
- Export class `CircularBuffer<T>`.
- Constructor accepts `capacity: number`. If `capacity <= 0`, throw `new Error("Capacity must be positive")`.
- Internal array `buffer: Array<T | undefined>` of fixed size `capacity`, `head: number = 0`, `tail: number = 0`, `count: number = 0`.
- Method `write(item: T): boolean`: if buffer is full, returns `false`; otherwise stores item at `tail`, updates `tail = (tail + 1) % capacity`, increments `count`, and returns `true`.
- Method `read(): T | undefined`: if buffer is empty, returns `undefined`; otherwise extracts item at `head`, sets slot to `undefined`, updates `head = (head + 1) % capacity`, decrements `count`, and returns item.
- Method `isFull(): boolean`: returns `count === capacity`.
- Method `isEmpty(): boolean`: returns `count === 0`.
- Getter `size: number`: returns `count`.
