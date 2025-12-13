export function bfSearcher<T>({
  start,
  getNodeNeighbors,
  nodeAction,
}: {
  start: T;
  getNodeNeighbors: (node: T) => T[];
  nodeAction: ({ current, next }: { current: T; next: T }) => void;
}) {
  const frontier = [];
  frontier.push(start);
  const cameFrom = new Map<T, T | null>();
  cameFrom.set(start, null);
  while (true) {
    const current = frontier.shift();
    if (current === undefined) {
      break;
    }
    const neighbors = getNodeNeighbors(current);
    for (const next of neighbors) {
      nodeAction({ current, next: next });
      if (cameFrom.get(next) === undefined) {
        frontier.push(next);
        cameFrom.set(next, current);
      }
    }
  }
}
