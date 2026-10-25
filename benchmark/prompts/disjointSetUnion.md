# Disjoint Set Union (Union-Find)
Create a Disjoint Set Union (Union-Find) data structure with path compression and union by rank in a single file.

Requirements:
- Export class `DisjointSetUnion`.
- Constructor accepts `size: number`: initializes `parent: number[]` with `parent[i] = i`, and `rank: number[]` with `rank[i] = 0`.
- Method `find(i: number): number`: recursively finds root of set containing `i` with path compression (`parent[i] = find(parent[i])`).
- Method `union(i: number, j: number): boolean`: finds roots of `i` and `j`. If same root, return `false`. Otherwise attach smaller rank tree under larger rank tree (incrementing rank if equal), and return `true`.
- Method `connected(i: number, j: number): boolean`: returns `this.find(i) === this.find(j)`.
