import { mazeGraphics, mazeLayer } from "./maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "./constants";
import { adaptMemo, adaptState } from "promethium-js";
import { drawPlayerGraphics } from "./player";
import { getCSSVariable } from "./renderUtils";
import { drawEnemiesGraphics } from "./enemies";
import { drawKeysGraphics } from "./keys";
import { drawPowerUpsGraphics } from "./powerUps";
import { Program } from "./interpreter";

const [orchestratorState, setOrchestratorState] = adaptState<{
  level: number;
  currentStatementsIndex: number;
}>({ level: 1, currentStatementsIndex: 0 });

const [program, setProgram] = adaptState<Program>([
  { id: crypto.randomUUID(), type: "Statements", contents: [] },
]);

export const currentStatements = adaptMemo(() => {
  return program()[orchestratorState().currentStatementsIndex];
});

export async function initializeGame(canvas?: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    autoStart: true,
    background: getCSSVariable("--sl-color-neutral-0"),
    canvas,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
  });

  app.stage.addChild(mazeLayer);
  app.stage.addChild(mazeGraphics);

  drawPowerUpsGraphics(app.stage);
  drawKeysGraphics(app.stage);
  drawEnemiesGraphics(app.stage);
  drawPlayerGraphics(app.stage);

  app.ticker.add((ticker) => {
    // update playerGraphics
    // update maze
    // update enemy graphics
    // update powerUp graphics
  });
}
