# Doubly Linked List
Create a generic Doubly Linked List in a single file without external libraries.

Requirements:
- Class `DoublyNode<T>`: property `value: T`, `prev: DoublyNode<T> | null = null`, `next: DoublyNode<T> | null = null`.
- Export class `DoublyLinkedList<T>`: properties `head: DoublyNode<T> | null = null`, `tail: DoublyNode<T> | null = null`, `size: number = 0`.
- Method `push(value: T): void`: appends to tail.
- Method `unshift(value: T): void`: prepends to head.
- Method `pop(): T | undefined`: removes and returns tail value.
- Method `shift(): T | undefined`: removes and returns head value.
- Method `toArray(): T[]`: traverses head-to-tail and returns array of values.
- Method `toArrayReverse(): T[]`: traverses tail-to-head and returns array of values.
