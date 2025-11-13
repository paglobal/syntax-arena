import { Container, Graphics, RenderLayer } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  INITIAL_ARENA_COLUMN_COUNT,
  INITIAL_ARENA_ROW_COUNT,
  ARENA_WALL_THICKNESS,
} from "@/utils";
import { generateMaze } from "./mazeUtils";

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
