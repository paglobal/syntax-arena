import { iconButton } from "@/iconButton";
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
          {iconButton({
            iconLabel: "Previous",
            iconName: "caret-left",
            onClick() {},
          })}
          <wa-callout variant="neutral">
            <wa-icon slot="icon" name="circle-info"></wa-icon>
            information here! No information here! No information here! No
          </wa-callout>
          {iconButton({
            iconLabel: "Next",
            iconName: "caret-right",
            onClick() {},
          })}
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
              buttonStyles: {
                "grid-column": 2,
                "grid-row": 1,
              },
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-left",
              iconLabel: "Left",
              id: "d-pad-left",
              buttonStyles: {
                "grid-column": 1,
                "grid-row": 2,
              },
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-right",
              iconLabel: "Right",
              id: "d-pad-right",
              buttonStyles: {
                "grid-column": 3,
                "grid-row": 2,
              },
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-down",
              iconLabel: "Down",
              id: "d-pad-down",
              buttonStyles: {
                "grid-column": 2,
                "grid-row": 3,
              },
              onClick() {},
            })}
            {iconButton({
              iconName: "circle",
              iconLabel: "Center",
              id: "d-pad-center",
              buttonStyles: {
                "grid-column": 2,
                "grid-row": 2,
              },
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-up",
              iconLabel: "Up-Left",
              id: "d-pad-up-left",
              buttonStyles: {
                "grid-column": 1,
                "grid-row": 1,
                transform: "rotate(-45deg)",
              },
              appearance: "filled",
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-up",
              iconLabel: "Up-Right",
              id: "d-pad-up-right",
              buttonStyles: {
                "grid-column": 3,
                "grid-row": 1,
                transform: "rotate(45deg)",
              },
              appearance: "filled",
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-down",
              iconLabel: "Down-Left",
              id: "d-pad-down-left",
              buttonStyles: {
                "grid-column": 1,
                "grid-row": 3,
                transform: "rotate(45deg)",
              },
              appearance: "filled",
              onClick() {},
            })}
            {iconButton({
              iconName: "caret-down",
              iconLabel: "Down-Right",
              id: "d-pad-down-right",
              buttonStyles: {
                "grid-column": 3,
                "grid-row": 3,
                transform: "rotate(-45deg)",
              },
              appearance: "filled",
              onClick() {},
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
