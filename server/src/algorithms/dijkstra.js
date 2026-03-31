const dijkstraShortestDistance = (graph, source, target) => {
  if (!graph[source] || !graph[target]) {
    return Number.POSITIVE_INFINITY;
  }

  const distances = {};
  const visited = new Set();
  const queue = [];

  Object.keys(graph).forEach((node) => {
    distances[node] = Number.POSITIVE_INFINITY;
  });

  distances[source] = 0;
  queue.push({ node: source, distance: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();

    if (visited.has(current.node)) {
      continue;
    }

    visited.add(current.node);

    if (current.node === target) {
      return current.distance;
    }

    const neighbors = graph[current.node] || {};
    Object.entries(neighbors).forEach(([neighbor, weight]) => {
      if (!visited.has(neighbor)) {
        const tentativeDistance = current.distance + weight;
        if (tentativeDistance < distances[neighbor]) {
          distances[neighbor] = tentativeDistance;
          queue.push({ node: neighbor, distance: tentativeDistance });
        }
      }
    });
  }

  return Number.POSITIVE_INFINITY;
};

module.exports = dijkstraShortestDistance;
