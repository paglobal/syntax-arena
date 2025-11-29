import hotkeys from "hotkeys-js";

export function initializeKeybindings() {
  hotkeys.filter = function (e) {
    const target = e.target;
    const tagName = (target as HTMLElement)?.tagName;

    return !(tagName === "WA-INPUT");
  };

  // hotkeys("h,left,esc", commandForge.exitFocusedShard);
  // hotkeys("l,right,enter", commandForge.enterFocusedShard);
  // hotkeys("j,down", commandForge.focusNextSiblingShard);
  // hotkeys("k,up", commandForge.focusPreviousSiblingShard);
  // hotkeys("a", commandForge.addShardInFrontOfFocusedShardAndFocus);
  // hotkeys("i", commandForge.addShardBehindFocusedShardAndFocus);
  // hotkeys("d", commandForge.deleteFocusedShard);
  // hotkeys("t", commandForge.toggleFocusedShardType);
  // hotkeys("e", commandForge.executeFocusedStatements);
  // hotkeys("space", commandForge.toggleGameLoopPlayingState);
}
