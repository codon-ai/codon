# Min Binary Heap Priority Queue
Create a Min Binary Heap (Priority Queue) in a single file without external libraries.

Requirements:
- Export class `MinBinaryHeap<T>`.
- Constructor accepts optional comparator `compare: (a: T, b: T) => number` defaulting to `(a, b) => (a < b ? -1 : a > b ? 1 : 0)`.
- Internal array `heap: T[] = []`.
- Method `push(val: T): void`: appends `val` to end and bubbles up maintaining heap property.
- Method `pop(): T | undefined`: extracts minimum element at index 0, moves last element to root, sinks down maintaining heap property, and returns popped element.
- Method `peek(): T | undefined`: returns element at index 0 without removing it.
- Getter `size: number`: returns `this.heap.length`.
