import { styleMap } from "lit/directives/style-map.js";
import { SyntaxShard } from "./SyntaxShard";
import { createRef, ref } from "lit/directives/ref.js";
import { imperativeUpdate } from "promethium-js";
import { commandForgeState, setCommandForgeState } from "./state";
import { NamedContainer } from "./NamedContainer";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";

export const forgeInputRef = createRef<WaInput>();

export function CommandForge() {
  return () => {
    const focusedShard = commandForgeState().focusedShard;
    let visibleShard = focusedShard;

    if (focusedShard.parent === null) {
      visibleShard = focusedShard.body[0];
    } else if (focusedShard.parent?.type !== "Program") {
      visibleShard = focusedShard.parent;
    }

    return (
      <>
        <wa-input
          // TODO: investigate using this instead of keydown and enter
          // on:sl-change={() => console.log("hi")}
          on:keydown={(e) => {
            if (e.key === "Escape") {
              if (forgeInputRef.value) {
                forgeInputRef.value.blur();
                forgeInputRef.value.value = "";
              }
            }

            if (e.key === "Enter") {
              if (
                forgeInputRef.value?.value !== undefined &&
                forgeInputRef.value?.value !== null
              ) {
                if (focusedShard.type === "String") {
                  focusedShard.value = forgeInputRef.value.value;
                } else if (focusedShard.type === "Number") {
                  focusedShard.value = Number(forgeInputRef.value.value);
                }
                forgeInputRef.value.updateComplete.then(() => {
                  if (forgeInputRef.value?.value) {
                    forgeInputRef.value.value = "";
                  }
                });
                forgeInputRef.value?.blur();
                setCommandForgeState(imperativeUpdate);
              }
            }
          }}
          use:ref={ref(forgeInputRef)}
          $attr:style={styleMap({ marginBottom: "2rem" })}
        ></wa-input>
        <NamedContainer id="CommandForge" name="CommandForge">
          <SyntaxShard syntaxShard={visibleShard}></SyntaxShard>
        </NamedContainer>
      </>
    );
  };
}
