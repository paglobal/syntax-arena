import { styleMap } from "lit/directives/style-map.js";
import { SyntaxShard } from "./SyntaxShard";
import { createRef, ref } from "lit/directives/ref.js";
import { SlInput } from "@shoelace-style/shoelace";
import { imperativeUpdate } from "promethium-js";
import {
  orchestratorState,
  setOrchestratorState,
} from "./orchestrator/orchestrator";

export const forgeInputRef = createRef<SlInput>();

export function CommandForge() {
  return () => {
    const focusedShard = orchestratorState().focusedShard;
    let visibleShard = focusedShard;

    if (focusedShard.parent === null) {
      visibleShard = focusedShard.body[0];
    } else if (focusedShard.parent?.type !== "Program") {
      visibleShard = focusedShard.parent;
    }

    return (
      <>
        <sl-input
          // TODO: investigate using this instead of keydown and enter
          // on:sl-change={() => console.log("hi")}
          on:keydown={(e) => {
            if (e.key === "Escape") {
              if (forgeInputRef.value) {
                document.getElementById(focusedShard.id)?.focus();
                forgeInputRef.value.value = "";
              }
            }

            if (e.key === "Enter") {
              if (forgeInputRef.value?.value) {
                if (focusedShard.type === "String") {
                  focusedShard.value = forgeInputRef.value.value;
                } else if (focusedShard.type === "Identifier") {
                  focusedShard.name = forgeInputRef.value.value;
                } else if (focusedShard.type === "Number") {
                  focusedShard.value = Number(forgeInputRef.value.value);
                }
                forgeInputRef.value.updateComplete.then(() => {
                  if (forgeInputRef.value?.value) {
                    forgeInputRef.value.value = "";
                  }
                });
                document.getElementById(focusedShard.id)?.focus();
                setOrchestratorState(imperativeUpdate);
              }
            }
          }}
          use:ref={ref(forgeInputRef)}
          $attr:style={styleMap({ marginBottom: "2rem" })}
        ></sl-input>
        <SyntaxShard
          name={`CommandForge - ${visibleShard.type}`}
          syntaxShard={visibleShard}
        ></SyntaxShard>
      </>
    );
  };
}
