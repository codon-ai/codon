export function dijkstra(graph, startNode) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        curr = node;
      }
    }

    if (curr === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(curr);

    for (const [neighbor, weight] of Object.entries(graph[curr] || {})) {
      if (unvisited.has(neighbor)) {
        const alt = distances[curr] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = curr;
        }
      }
    }
  }

  return { distances, previous };
}
