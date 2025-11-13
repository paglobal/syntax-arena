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
          width: "100%",
          height: "100%",
          padding: "1rem",
          display: "flex",
          "flex-direction": "column",
          "justify-content": "space-between",
        })}
      >
        <div
          $attr:style={styleMap({
            display: "flex",
            "justify-content": "space-between",
          })}
        >
          <wa-callout variant="neutral">
            <wa-icon slot="icon" name="circle-info"></wa-icon>
            information here! No information here! No information here! No
          </wa-callout>
        </div>
        <div
          $attr:style={styleMap({
            display: "flex",
            "justify-content": "flex-end",
          })}
        >
          <div
            $attr:style={styleMap({
              display: "grid",
              "grid-template-columns": "repeat(3, auto)",
              "grid-template-rows": "repeat(3, auto)",
              gap: "0.25rem",
              width: "max-content",
            })}
          >
            <wa-button
              appearance="filled"
              pill
              id="d-pad-up"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 1,
              })}
            >
              <wa-icon name="house" label="Home"></wa-icon>
            </wa-button>
            <wa-button
              appearance="filled"
              pill
              id="d-pad-left"
              $attr:style={styleMap({
                "grid-column": 1,
                "grid-row": 2,
              })}
            >
              <wa-icon name="house" label="Home"></wa-icon>
            </wa-button>
            <wa-button
              appearance="filled"
              pill
              id="d-pad-right"
              $attr:style={styleMap({
                "grid-column": 3,
                "grid-row": 2,
              })}
            >
              <wa-icon name="house" label="Home"></wa-icon>
            </wa-button>
            <wa-button
              appearance="filled"
              pill
              id="d-pad-down"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 3,
              })}
            >
              <wa-icon name="house" label="Home"></wa-icon>
            </wa-button>
            <wa-button
              pill
              id="d-pad-down"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 2,
              })}
            >
              <wa-icon name="house" label="Home"></wa-icon>
            </wa-button>
          </div>
        </div>
      </div>
    </div>
  );
}
