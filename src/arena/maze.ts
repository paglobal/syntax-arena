import { Container, Graphics, RenderLayer } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  INITIAL_ARENA_COLUMN_COUNT,
  INITIAL_ARENA_ROW_COUNT,
  ARENA_WALL_THICKNESS,
} from "./constants";

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

const [mazeState] = adaptState(() => ({
  maze: generateMaze({
    noOfRows: INITIAL_ARENA_ROW_COUNT,
    noOfColumns: INITIAL_ARENA_COLUMN_COUNT,
  }),
}));

export function drawMazeGraphics(container: Container) {
  const mazeLayer = new RenderLayer();
  container.addChild(mazeLayer);
  const mazeGraphics = new Graphics();
  container.addChild(mazeGraphics);
  mazeLayer.attach(mazeGraphics);
  adaptSyncEffect(() => {
    const _mazeState = mazeState();
    mazeGraphics.clear();
    for (let row = 0; row < _mazeState.maze.length; row++) {
      for (let column = 0; column < _mazeState.maze[row].length; column++) {
        const cell = _mazeState.maze[row][column];
        const x = column * ARENA_CELL_SIZE;
        const y = row * ARENA_CELL_SIZE;
        if (cell.walls.top) {
          mazeGraphics.moveTo(x, y);
          mazeGraphics.lineTo(x + ARENA_CELL_SIZE, y);
        }
        if (cell.walls.right) {
          mazeGraphics.moveTo(x + ARENA_CELL_SIZE, y);
          mazeGraphics.lineTo(x + ARENA_CELL_SIZE, y + ARENA_CELL_SIZE);
        }
        if (cell.walls.bottom) {
          mazeGraphics.moveTo(x, y + ARENA_CELL_SIZE);
          mazeGraphics.lineTo(x + ARENA_CELL_SIZE, y + ARENA_CELL_SIZE);
        }
        if (cell.walls.left) {
          mazeGraphics.moveTo(x, y);
          mazeGraphics.lineTo(x, y + ARENA_CELL_SIZE);
        }
      }
      mazeGraphics.stroke({ width: ARENA_WALL_THICKNESS, color: 0xffffff });
    }
  });
}
