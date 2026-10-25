export function dfs(graph, startNode) {
  const visited = new Set();
  const visitedOrder = [];

  function traverse(node) {
    if (visited.has(node)) return;
    visited.add(node);
    visitedOrder.push(node);
    for (const neighbor of graph[node] || []) {
      traverse(neighbor);
    }
  }

  traverse(startNode);
  return visitedOrder;
}
