import { drawMazeGraphics } from "@/arena/maze";
import { Application } from "pixi.js";
import { drawPlayerGraphics } from "./player";
import { getCSSVariable } from "@/utils";
import { drawEnemiesGraphics } from "./enemies";
import { drawKeysGraphics } from "./keys";
import { drawPowerUpsGraphics } from "./powerUps";
import { CANVAS_CONTAINER_ID } from "@/constants";

export async function initializeArena() {
  const resizeTo = document.querySelector(
    `#${CANVAS_CONTAINER_ID}`,
  ) as HTMLElement;
  const app = new Application();
  await app.init({
    autoStart: true,
    background: getCSSVariable("--wa-color-neutral-05"),
    resizeTo,
  });

  resizeTo.appendChild(app.canvas);

  drawMazeGraphics(app.stage);
  drawPowerUpsGraphics(app.stage);
  drawKeysGraphics(app.stage);
  drawEnemiesGraphics(app.stage);
  drawPlayerGraphics(app.stage);
}
