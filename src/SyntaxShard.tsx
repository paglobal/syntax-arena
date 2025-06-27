import { styleMap } from "lit/directives/style-map.js";

export function SyntaxShard(props: { display: "inline" | "block" }) {
  return () => (
    <div $attr:style={styleMap({ display: props.display })}>Shard</div>
  );
}