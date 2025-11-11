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
      })}
    >
      <wa-callout variant="neutral">
        <wa-icon slot="icon" name="circle-info"></wa-icon>
        information here! No information here! No information here! No
      </wa-callout>
    </div>
  );
}
