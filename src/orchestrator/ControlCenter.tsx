import { styleMap } from "lit/directives/style-map.js";

export function ControlCenter() {
  return () => (
    <div
      $attr:style={styleMap({
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        padding: "1rem",
        display: "flex",
        "justify-content": "space-between",
        gap: "0.3rem",
      })}
    >
      <wa-callout variant="neutral">
        <wa-icon slot="icon" name="circle-info"></wa-icon>
        No information here! No information here! No information here! No
      </wa-callout>
      <wa-button size="small">
        <wa-icon name="pause" label="Pause"></wa-icon>
      </wa-button>
    </div>
  );
}
