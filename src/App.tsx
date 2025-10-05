import { styleMap } from "lit/directives/style-map.js";
import { Arena } from "./arena/Arena";
import { StrategySandbox } from "./strategy-sandbox/StrategySandbox";

export function App() {
  return () => (
    <sl-split-panel>
      <div
        slot="start"
        $attr:style={styleMap({
          height: "100vh",
          overflow: "auto",
          background: "var(--sl-color-neutral-0)",
          padding: "1rem",
        })}
      >
        <StrategySandbox />
      </div>
      <div
        slot="end"
        $attr:style={styleMap({
          height: "100vh",
          overflow: "auto",
          display: "grid",
          placeItems: "center",
          background: "var(--sl-color-neutral-0)",
          padding: "1rem",
        })}
      >
        <Arena />
      </div>
    </sl-split-panel>
  );
}
