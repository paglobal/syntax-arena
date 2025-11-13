type WallKind = "solid" | "breakable" | null;

type Cell = {
  row: number;
  column: number;
  walls: {
    top: WallKind;
    right: WallKind;
    bottom: WallKind;
    left: WallKind;
  };
  visited: boolean;
};

type Maze = Cell[][];

const walls = { t: "top", r: "right", b: "bottom", l: "left" } as const;

const neighborWalls = {
  t: walls.b,
  r: walls.l,
  b: walls.t,
  l: walls.r,
} as const;

const neighborOffsets = {
  t: { dr: -1, dc: 0 },
  r: { dr: 0, dc: 1 },
  b: { dr: 1, dc: 0 },
  l: { dr: 0, dc: -1 },
} as const;

const directionObjects = [
  getDirectionObject("t"),
  getDirectionObject("r"),
  getDirectionObject("b"),
  getDirectionObject("l"),
];

function getDirectionObject(wallLetter: keyof typeof walls) {
  return {
    ...neighborOffsets[wallLetter],
    wall: walls[wallLetter],
    neighborWall: neighborWalls[wallLetter],
  };
}

function createShuffledDirectionObjects(
  array: typeof directionObjects,
): typeof directionObjects {
  const shuffledDirectionObjects = [...array];
  for (let i = shuffledDirectionObjects.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDirectionObjects[i], shuffledDirectionObjects[j]] = [
      shuffledDirectionObjects[j],
      shuffledDirectionObjects[i],
    ];
  }

  return shuffledDirectionObjects;
}

export function generateMaze({
  noOfRows,
  noOfColumns,
}: {
  noOfRows: number;
  noOfColumns: number;
}) {
  const maze: Maze = [];
  for (let row = 0; row < noOfRows; row++) {
    maze[row] = [];
    for (let column = 0; column < noOfColumns; column++) {
      maze[row][column] = {
        row,
        column,
        walls: {
          top: "solid",
          right: "solid",
          bottom: "solid",
          left: "solid",
        },
        visited: false,
      };
    }
  }
  function dfsPathCarve({ row, column }: { row: number; column: number }) {
    maze[row][column].visited = true;
    const shuffledDirectionObjects =
      createShuffledDirectionObjects(directionObjects);
    for (const directionObjects of shuffledDirectionObjects) {
      const newRow = row + directionObjects.dr;
      const newColumn = column + directionObjects.dc;
      const newCellIsValid =
        newRow >= 0 &&
        newRow < noOfRows &&
        newColumn >= 0 &&
        newColumn < noOfColumns;
      if (newCellIsValid && !maze[newRow][newColumn].visited) {
        maze[row][column].walls[directionObjects.wall] = null;
        maze[newRow][newColumn].walls[directionObjects.neighborWall] = null;
        dfsPathCarve({ row: newRow, column: newColumn });
      }
    }
  }
  const startRow = 0;
  const startColumn = 0;
  dfsPathCarve({ row: startRow, column: startColumn });

  return maze;
}

export function bfsRunner<T>({
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
