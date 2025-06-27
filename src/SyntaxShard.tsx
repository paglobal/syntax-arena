export function SyntaxShard(props: { display: "inline" | "block" }) {
  return props.display === "inline" ? <span></span> : <div></div>;
}