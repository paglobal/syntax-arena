import { mazeGraphics, mazeLayer } from "@/arena/maze";
import { Application } from "pixi.js";
import { drawPlayerGraphics } from "./player";
import { getCSSVariable } from "@/utils";
import { drawEnemiesGraphics } from "./enemies";
import { drawKeysGraphics } from "./keys";
import { drawPowerUpsGraphics } from "./powerUps";
import { canvasRef } from "./Arena";

export async function initializeArena(tickerCallback: () => void) {
  const app = new Application();
  await app.init({
    autoStart: true,
    background: getCSSVariable("--wa-color-neutral-05"),
    canvas: canvasRef.value,
    resizeTo: document.querySelector("#canvas-container") as HTMLElement,
  });

  app.stage.addChild(mazeLayer);
  app.stage.addChild(mazeGraphics);

  drawPowerUpsGraphics(app.stage);
  drawKeysGraphics(app.stage);
  drawEnemiesGraphics(app.stage);
  drawPlayerGraphics(app.stage);

  app.ticker.add(tickerCallback);
}
