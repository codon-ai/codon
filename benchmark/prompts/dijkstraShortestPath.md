# Dijkstra's Shortest Path Algorithm
Create Dijkstra's shortest path algorithm on a weighted adjacency graph in a single file.

Requirements:
- Type `Graph = Record<string, Record<string, number>>`.
- Export interface `DijkstraResult { distances: Record<string, number>; previous: Record<string, string | null>; }`.
- Export function `dijkstra(graph: Graph, startNode: string): DijkstraResult`.
- Initialize `distances` object with all nodes at `Infinity` except `distances[startNode] = 0`.
- Initialize `previous` map with all nodes set to `null`.
- Maintain an unvisited `Set<string>` containing all graph nodes.
- Iterate while unvisited set is not empty: select unvisited node with smallest distance. If smallest distance is `Infinity`, break.
- For each neighbor of current node: calculate tentative distance `distances[curr] + weight`. If less than `distances[neighbor]`, update distance and set `previous[neighbor] = curr`.
- Remove current node from unvisited set.
- Return `{ distances, previous }`.
