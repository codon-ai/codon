# Breadth-First Search (BFS) Traversal
Create a Breadth-First Search graph traversal function in a single file.

Requirements:
- Type `AdjacencyList = Record<string, string[]>`.
- Export function `bfs(graph: AdjacencyList, startNode: string): string[]`.
- Maintain a queue array initialized with `[startNode]`.
- Maintain a `Set<string>` of visited nodes initialized with `startNode`.
- Maintain an output array `visitedOrder: string[] = []`.
- Loop while queue is not empty: shift current node from queue, push to `visitedOrder`.
- For each unvisited neighbor in `graph[curr] || []`: mark visited and push to queue.
- Return `visitedOrder`.
