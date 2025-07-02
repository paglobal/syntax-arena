import { styleMap } from "lit/directives/style-map.js";
import { SyntaxShardView } from "./SyntaxShardView";
import { currentStatements, focusedShard, setProgram } from "./orchestrator";
import { createRef, ref } from "lit/directives/ref.js";
import { SlInput } from "@shoelace-style/shoelace";
import { imperativeUpdate } from "promethium-js";

export const forgeInputRef = createRef<SlInput>();

export function CommandForge() {
  return () => (
    <>
      <sl-input
        on:sl-change={() => console.log("hi")}
        on:keydown={(e) => {
          if (e.key === "Escape") {
            if (forgeInputRef.value) {
              document.getElementById(focusedShard().id)?.focus();
              forgeInputRef.value.value = "";
            }
          }

          if (e.key === "Enter") {
            const _focusedShard = focusedShard();
            if (forgeInputRef.value?.value) {
              if (_focusedShard.type === "String") {
                _focusedShard.value = forgeInputRef.value.value;
              } else if (_focusedShard.type === "Identifier") {
                _focusedShard.name = forgeInputRef.value.value;
              } else if (_focusedShard.type === "Number") {
                _focusedShard.value = Number(forgeInputRef.value.value);
              }
              forgeInputRef.value.updateComplete.then(() => {
                if (forgeInputRef.value?.value) {
                  forgeInputRef.value.value = "";
                }
              });
              document.getElementById(focusedShard().id)?.focus();
              setProgram(imperativeUpdate);
            }
          }
        }}
        use:ref={ref(forgeInputRef)}
        $attr:style={styleMap({ marginBottom: "2rem" })}
      ></sl-input>
      <SyntaxShardView
        name="CommandForge - Statements"
        syntaxShard={currentStatements()}
      ></SyntaxShardView>
    </>
  );
}
