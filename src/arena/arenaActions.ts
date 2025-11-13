import { drawMazeGraphics } from "@/arena/maze";
import { Application, Container } from "pixi.js";
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
  const centeredContainer = new Container();
  app.stage.addChild(centeredContainer);
  drawMazeGraphics(centeredContainer);
  drawPowerUpsGraphics(centeredContainer);
  drawKeysGraphics(centeredContainer);
  drawEnemiesGraphics(centeredContainer);
  drawPlayerGraphics(centeredContainer);
  centeredContainer.onRender = () => {
    centeredContainer.pivot.set(
      centeredContainer.width / 2,
      centeredContainer.height / 2,
    );
    centeredContainer.x = app.screen.width / 2;
    centeredContainer.y = app.screen.height / 2;
  };
}
