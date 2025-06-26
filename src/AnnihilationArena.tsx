import { createRef, ref } from "lit/directives/ref.js";
import { adaptEffect } from "promethium-js";
import { initializeGame } from "./gameControl";

export function AnnihilationArena() {
  const canvasRef = createRef<HTMLCanvasElement>();

  adaptEffect(() => {
    initializeGame(canvasRef.value);
  });

  return () => <canvas use:ref={ref(canvasRef)}></canvas>;
}
