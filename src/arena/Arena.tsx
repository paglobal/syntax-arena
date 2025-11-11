import { CANVAS_CONTAINER_ID } from "@/constants";
import { styleMap } from "lit/directives/style-map.js";

export function Arena() {
  return () => (
    <div
      id={CANVAS_CONTAINER_ID}
      $attr:style={styleMap({
        width: "100%",
        height: "100%",
      })}
    >
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
    </div>
  );
}
