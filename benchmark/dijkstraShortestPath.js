export function dijkstra(graph, startNode) {
  const distances = {}, previous = {}, unvisited = new Set();
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }
  distances[startNode] = 0;
  unvisited.add(startNode);
  while (unvisited.size > 0) {
    let curr = null, minDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        curr = node;
      }
    }
    if (curr === null || minDist === Infinity) break;
    unvisited.delete(curr);
    for (const [neighbor, weight] of Object.entries(graph[curr] || {})) {
      const alt = distances[curr] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = curr;
      }
    }
  }
  return { distances, previous };
}
