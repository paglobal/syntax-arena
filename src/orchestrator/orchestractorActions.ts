import { actions as commandForgeActions } from "@/strategy-sandbox/command-forge/actions";
import hotkeys from "hotkeys-js";

export function initializeKeybindings() {
  hotkeys.filter = function (e) {
    const target = e.target;
    const tagName = (target as HTMLElement)?.tagName;

    return !(tagName === "WA-INPUT");
  };

  hotkeys("h,left,esc", commandForgeActions.exitFocusedShard);
  hotkeys("l,right,enter", commandForgeActions.enterFocusedShard);
  hotkeys("j,down", commandForgeActions.focusNextSiblingShard);
  hotkeys("k,up", commandForgeActions.focusPreviousSiblingShard);
  hotkeys("a", commandForgeActions.addShardInFrontOfFocusedShardAndFocus);
  hotkeys("i", commandForgeActions.addShardBehindFocusedShardAndFocus);
  hotkeys("d", commandForgeActions.deleteFocusedShard);
  hotkeys("t", commandForgeActions.toggleFocusedShardType);
  hotkeys("e", commandForgeActions.executeFocusedStatements);
  hotkeys("space", commandForgeActions.toggleGameLoopPlayingState);
}
