import { styleMap } from "lit/directives/style-map.js";
import { Arena } from "./Arena";
import { StrategySandbox } from "./StrategySandbox";

function App() {
  const containerStyles = {
    minHeight: "100vh",
    overflow: "auto",
    display: "grid",
    placeItems: "center",
    background: "var(--sl-color-neutral-0)",
  };

  return () => (
    <sl-split-panel>
      <div slot="start" $attr:style={styleMap(containerStyles)}>
        <StrategySandbox />
      </div>
      <div slot="end" $attr:style={styleMap(containerStyles)}>
        <Arena />
      </div>
    </sl-split-panel>
  );
}

export default App;
