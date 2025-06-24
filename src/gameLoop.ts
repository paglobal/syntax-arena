import { Application } from "pixi.js";

export async function initializeGame(canvas?: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    autoStart: false,
    background: "#fff",
    canvas,
    width: 800,
    height: 800,
  });

  app.ticker.add((time) => {});
}