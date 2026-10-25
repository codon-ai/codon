# Singly Linked List
Create a generic Singly Linked List in a single file without external libraries.

Requirements:
- Class `ListNode<T>`: property `value: T`, property `next: ListNode<T> | null = null`.
- Export class `SinglyLinkedList<T>`: properties `head: ListNode<T> | null = null`, `tail: ListNode<T> | null = null`, `length: number = 0`.
- Method `append(value: T): void`: adds node to end of list, updates tail and length.
- Method `prepend(value: T): void`: adds node to beginning of list, updates head and length.
- Method `delete(value: T): boolean`: finds first matching node, unlinks it, decrements length, and returns `true`; returns `false` if not found.
- Method `find(predicate: (val: T) => boolean): T | undefined`: returns value of first matching node, or `undefined`.
- Method `toArray(): T[]`: returns array of all values from head to tail.
