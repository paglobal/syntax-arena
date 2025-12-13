import { CANVAS_CONTAINER_ID } from "./constants";
import { styleMap } from "lit/directives/style-map.js";

function iconButton(props: {
  iconName: string;
  iconLabel: string;
  id?: string;
  styles?: Record<string, string | number>;
}) {
  return (
    <>
      <wa-button
        size="small"
        appearance="filled"
        pill
        id={props.id}
        $attr:style={styleMap(props.styles ?? {})}
      >
        <wa-icon name={props.iconName} label={props.iconLabel}></wa-icon>
      </wa-button>
    </>
  );
}

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
          {iconButton({ iconLabel: "Previous", iconName: "caret-left" })}
          <wa-callout variant="neutral">
            <wa-icon slot="icon" name="circle-info"></wa-icon>
            information here! No information here! No information here! No
          </wa-callout>
          {iconButton({ iconLabel: "Next", iconName: "caret-right" })}
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
            {iconButton({
              iconName: "caret-up",
              iconLabel: "Up",
              id: "d-pad-up",
              styles: {
                "grid-column": 2,
                "grid-row": 1,
              },
            })}
            {iconButton({
              iconName: "caret-left",
              iconLabel: "Left",
              id: "d-pad-left",
              styles: {
                "grid-column": 1,
                "grid-row": 2,
              },
            })}
            {iconButton({
              iconName: "caret-right",
              iconLabel: "Right",
              id: "d-pad-right",
              styles: {
                "grid-column": 3,
                "grid-row": 2,
              },
            })}
            {iconButton({
              iconName: "caret-down",
              iconLabel: "Down",
              id: "d-pad-down",
              styles: {
                "grid-column": 2,
                "grid-row": 3,
              },
            })}
            {iconButton({
              iconName: "circle",
              iconLabel: "Center",
              id: "d-pad-center",
              styles: {
                "grid-column": 2,
                "grid-row": 2,
              },
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
