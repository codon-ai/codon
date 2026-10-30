export function bfs(graph, startNode) {
  const queue = [startNode];
  const visited = new Set([startNode]);
  const visitedOrder = [];
  while (queue.length > 0) {
    const curr = queue.shift();
    visitedOrder.push(curr);
    for (const neighbor of graph[curr] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visitedOrder;
}
