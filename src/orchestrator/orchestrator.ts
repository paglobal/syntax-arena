import { initializeArena } from "@/arena/arenaActions";
import { initializeKeybindings } from "./orchestractorActions";

export async function initialize() {
  initializeKeybindings();
  initializeArena(() => {});
}
