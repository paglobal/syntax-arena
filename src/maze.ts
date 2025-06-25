import { Graphics, RenderLayer } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  ARENA_COLUMN_COUNT,
  ARENA_ROW_COUNT,
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

export function generateMaze(noOfRows: number, noOfColumns: number) {
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

  function dfs(row: number, column: number) {
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

        dfs(newRow, newColumn);
      }
    }
  }

  const startRow = 0;
  const startColumn = 0;

  dfs(startRow, startColumn);

  return maze;
}

const [mazeState, setMazeState] = adaptState(() =>
  generateMaze(ARENA_ROW_COUNT, ARENA_COLUMN_COUNT),
);

export const mazeLayer = new RenderLayer();
export const mazeGraphics = new Graphics();
mazeLayer.attach(mazeGraphics);

function drawMazeGraphics() {
  const maze = mazeState();
  adaptSyncEffect(() => {
    mazeGraphics.clear();
    for (let row = 0; row < maze.length; row++) {
      for (let column = 0; column < maze[row].length; column++) {
        const cell = maze[row][column];
        const x = column * ARENA_CELL_SIZE;
        const y = row * ARENA_CELL_SIZE;

        if (cell.walls.top) {
          mazeGraphics.moveTo(x, y);
          mazeGraphics.lineTo(x + ARENA_CELL_SIZE, y);
          // cell.walls.top === "breakable"
          //   ? mazeGraphics.stroke({ width: 2, color: 0x00ffff })
          //   : mazeGraphics.stroke({ width: 2, color: 0xffffff });
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

drawMazeGraphics();

function updateMazeState() {}
