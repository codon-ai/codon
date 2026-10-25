# Depth-First Search (DFS) Traversal
Create a recursive Depth-First Search graph traversal function in a single file.

Requirements:
- Type `AdjacencyList = Record<string, string[]>`.
- Export function `dfs(graph: AdjacencyList, startNode: string): string[]`.
- Maintain a `Set<string>` of visited nodes.
- Maintain an output array `visitedOrder: string[] = []`.
- Helper function `traverse(node: string)`: if `visited.has(node)` return; add `node` to `visited`, push `node` to `visitedOrder`.
- For each neighbor in `graph[node] || []`: call `traverse(neighbor)`.
- Invoke `traverse(startNode)` and return `visitedOrder`.
