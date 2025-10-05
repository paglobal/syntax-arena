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
const directions = [
  getDirection("t"),
  getDirection("r"),
  getDirection("b"),
  getDirection("l"),
];

function getDirection(wallLetter: keyof typeof walls) {
  return {
    ...neighborOffsets[wallLetter],
    wall: walls[wallLetter],
    neighborWall: neighborWalls[wallLetter],
  };
}

function createShuffledDirections(array: typeof directions): typeof directions {
  const shuffledDirections = [...array];

  for (let i = shuffledDirections.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffledDirections[i], shuffledDirections[j]] = [
      shuffledDirections[j],
      shuffledDirections[i],
    ];
  }

  return shuffledDirections;
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

  function dfs({ row, column }: { row: number; column: number }) {
    maze[row][column].visited = true;

    const shuffledDirections = createShuffledDirections(directions);

    for (const direction of shuffledDirections) {
      const newRow = row + direction.dr;
      const newColumn = column + direction.dc;
      const newRowIsValid =
        newRow >= 0 &&
        newRow < noOfRows &&
        newColumn >= 0 &&
        newColumn < noOfColumns;

      if (newRowIsValid && !maze[newRow][newColumn].visited) {
        maze[row][column].walls[direction.wall] = null;
        maze[newRow][newColumn].walls[direction.neighborWall] = null;

        dfs({ row: newRow, column: newColumn });
      }
    }
  }

  const startRow = 0;
  const startColumn = 0;

  dfs({ row: startRow, column: startColumn });

  return maze;
}
