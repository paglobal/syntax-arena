import { styleMap } from "lit/directives/style-map.js";
import { AnnihilationArena } from "./AnnihilationArena";
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
        <AnnihilationArena />
      </div>
    </sl-split-panel>
  );
}

export default App;
