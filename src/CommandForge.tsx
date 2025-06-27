import { SyntaxShard } from "./SyntaxShard";

export function CommandForge() {
  return () => (
    <div>
      <SyntaxShard display="inline"></SyntaxShard>
      <SyntaxShard display="inline"></SyntaxShard>
    </div>
  );
}
