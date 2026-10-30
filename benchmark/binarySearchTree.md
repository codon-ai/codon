# Binary Search Tree
Create a Binary Search Tree (BST) in a single file without external libraries.

Requirements:
- Class `TreeNode<T>`: property `value: T`, `left: TreeNode<T> | null = null`, `right: TreeNode<T> | null = null`.
- Export class `BinarySearchTree<T>`: property `root: TreeNode<T> | null = null`.
- Constructor accepts optional `compare?: (a: T, b: T) => number`.
- Method `insert(value: T): void`: inserts value in correct BST position.
- Method `contains(value: T): boolean`: searches tree returning `true` if found, `false` otherwise.
- Method `inOrder(): T[]`: performs in-order traversal (left, root, right) and returns values as a sorted array.
- Method `min(): T | undefined`: finds leftmost value; method `max(): T | undefined`: finds rightmost value.
