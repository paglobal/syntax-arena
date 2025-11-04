import { createRef, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

export const canvasRef = createRef<HTMLCanvasElement>();

export function Arena() {
  return () => (
    <div
      id="canvas-container"
      $attr:style={styleMap({
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        padding: 0,
        overflow: "hidden",
      })}
    >
      <canvas use:ref={ref(canvasRef)}></canvas>
    </div>
  );
}
