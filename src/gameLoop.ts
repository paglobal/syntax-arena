import { mazeGraphics, mazeLayer } from "./maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "./constants";
import { adaptMemo, adaptState } from "promethium-js";
import { drawPlayerGraphics } from "./player";

const [gameState, setGameState] = adaptState({ level: 1 });
const derivedGameState = adaptMemo(() => gameState());

export async function initializeGame(canvas?: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    autoStart: true,
    background: "#000000",
    canvas,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
  });

  app.stage.addChild(mazeLayer);
  app.stage.addChild(mazeGraphics);

  drawPlayerGraphics(app.stage);

  app.ticker.add((ticker) => {
    // update playerGraphics
    // update maze
    // update enemy graphics
    // update powerUp graphics
  });
}
