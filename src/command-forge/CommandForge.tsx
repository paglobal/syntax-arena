import { styleMap } from "lit/directives/style-map.js";
import { SyntaxShard } from "./SyntaxShard";
import { CommandForgeController } from "./forgeController";

function scrollFocusedShardIntoView(forgeController: CommandForgeController) {
  const viewportHeight = window.innerHeight;
  const elem = document.getElementById(
    forgeController.commandForgeState().focusedShard.id,
  );
  const elemHeight = elem?.getBoundingClientRect().height;
  const block = elemHeight && elemHeight > viewportHeight ? "start" : "end";
  elem?.scrollIntoView({ block, behavior: "smooth" });
}

export function CommandForge(props: {
  commandForgeController: CommandForgeController;
}) {
  return () => {
    const focusedShard =
      props.commandForgeController.commandForgeState().focusedShard;

    return (
      <div
        $attr:style={styleMap({
          width: "100%",
          height: "100%",
          padding: "1rem",
          "overflow-x": "hidden",
        })}
      >
        <SyntaxShard
          syntaxShard={focusedShard.parent ?? focusedShard}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </div>
    );
  };
}
