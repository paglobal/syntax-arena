import { CANVAS_CONTAINER_ID } from "./constants";
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
            "justify-content": "space-around",
            "align-items": "center",
            gap: "0.3rem",
          })}
        >
          <wa-button size="small" appearance="filled" pill>
            <wa-icon name="caret-left" label="Previous"></wa-icon>
          </wa-button>
          <wa-callout variant="neutral">
            <wa-icon slot="icon" name="circle-info"></wa-icon>
            information here! No information here! No information here! No
          </wa-callout>
          <wa-button size="small" appearance="filled" pill>
            <wa-icon name="caret-right" label="Next"></wa-icon>
          </wa-button>
        </div>
        <div
          $attr:style={styleMap({
            display: "flex",
            "justify-content": "flex-start",
          })}
        >
          <div
            $attr:style={styleMap({
              display: "grid",
              "grid-template-columns": "repeat(3, auto)",
              "grid-template-rows": "repeat(3, auto)",
              gap: "0.3rem",
              width: "max-content",
            })}
          >
            <wa-button
              size="small"
              appearance="filled"
              pill
              id="d-pad-up"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 1,
              })}
            >
              <wa-icon name="caret-up" label="Up"></wa-icon>
            </wa-button>
            <wa-button
              size="small"
              appearance="filled"
              pill
              id="d-pad-left"
              $attr:style={styleMap({
                "grid-column": 1,
                "grid-row": 2,
              })}
            >
              <wa-icon name="caret-left" label="Left"></wa-icon>
            </wa-button>
            <wa-button
              size="small"
              appearance="filled"
              pill
              id="d-pad-right"
              $attr:style={styleMap({
                "grid-column": 3,
                "grid-row": 2,
              })}
            >
              <wa-icon name="caret-right" label="Right"></wa-icon>
            </wa-button>
            <wa-button
              size="small"
              appearance="filled"
              pill
              id="d-pad-down"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 3,
              })}
            >
              <wa-icon name="caret-down" label="Down"></wa-icon>
            </wa-button>
            <wa-button
              size="small"
              pill
              id="d-pad-center"
              $attr:style={styleMap({
                "grid-column": 2,
                "grid-row": 2,
              })}
            >
              <wa-icon name="circle" label="Center"></wa-icon>
            </wa-button>
          </div>
        </div>
      </div>
    </div>
  );
}
