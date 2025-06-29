import { SyntaxShardView } from "./SyntaxShardView";
import { currentCommandBlock } from "./orchestrator";

export function CommandForge() {
  return () => (
    <SyntaxShardView
      name="CommandForge - Statements"
      syntaxShard={currentCommandBlock()}
    ></SyntaxShardView>
  );
}