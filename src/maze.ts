import { Graphics, RenderLayer } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  ARENA_COLUMN_COUNT,
  ARENA_ROW_COUNT,
  ARENA_WALL_THICKNESS,
} from "./constants";
import { generateMaze } from "./mazeUtils";

const [mazeState, setMazeState] = adaptState(() => ({
  maze: generateMaze(ARENA_ROW_COUNT, ARENA_COLUMN_COUNT),
}));

export const mazeLayer = new RenderLayer();
export const mazeGraphics = new Graphics();
mazeLayer.attach(mazeGraphics);

function drawMazeGraphics() {
  const _mazeState = mazeState();

  adaptSyncEffect(() => {
    mazeGraphics.clear();
    for (let row = 0; row < _mazeState.maze.length; row++) {
      for (let column = 0; column < _mazeState.maze[row].length; column++) {
        const cell = _mazeState.maze[row][column];
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
