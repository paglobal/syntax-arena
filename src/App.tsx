import { Arena } from "./arena/Arena";
import { ControlCenter } from "./orchestrator/ControlCenter";

export function App() {
  return () => (
    <>
      <Arena />
      <ControlCenter />
    </>
  );
}
