import { styleMap } from "lit/directives/style-map.js";
import { Arena } from "./arena/Arena";

export function App() {
  return () => (
    <div
      $attr:style={styleMap({
        height: "100vh",
        overflow: "auto",
        display: "grid",
        placeItems: "center",
        background: "var(--wa-color-neutral-0)",
        padding: "1rem",
      })}
    >
      <Arena />
    </div>
  );
}
