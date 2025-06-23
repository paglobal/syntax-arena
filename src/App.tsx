import { styleMap } from "lit/directives/style-map.js";

function App() {
  const containerStyles = {
    minHeight: "100vh",
    overflow: "auto"
  };

  return () => (
    <sl-split-panel>
      <div slot="start" $attr:style={styleMap(containerStyles)}>      dfadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddfddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
      </div>
      <div slot="end" $attr:style={styleMap(containerStyles)}>
        End
      </div>
    </sl-split-panel>
  );
}

export default App;
