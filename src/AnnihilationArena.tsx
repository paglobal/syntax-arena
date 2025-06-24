import { createRef, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import { adaptEffect } from "promethium-js";
import { Application, Container } from "pixi.js";

export function AnnihilationArena() {
  const canvasRef = createRef<HTMLCanvasElement>();

  adaptEffect(() => {
    async function init() {
      const app = new Application();
      await app.init({
        background: "#fff",
        canvas: canvasRef.value,
        width: 800,
        height: 800,
      });

      const container = new Container();
      app.stage.addChild(container);
      container.x = app.screen.width / 2;
      container.y = app.screen.height / 2;

      app.ticker.add((time) => {
        container.rotation -= 0.01 * time.deltaTime;
      });
    }

    init();
  });

  return () => (
    <canvas
      use:ref={ref(canvasRef)}
      $attr:style={styleMap({ margin: "auto", text: "center" })}
    ></canvas>
  );
}
