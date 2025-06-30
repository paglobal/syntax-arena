import { SyntaxShardView } from "./SyntaxShardView";
import { currentStatements } from "./orchestrator";

export function CommandForge() {
  return () => (
    <SyntaxShardView
      name="CommandForge - Statements"
      syntaxShard={currentStatements()}
    ></SyntaxShardView>
  );
}