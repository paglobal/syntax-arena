import { mazeGraphics, mazeLayer } from "@/arena/maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "@/constants";
import { drawPlayerGraphics } from "@/arena/player";
import { getCSSVariable } from "@/utils";
import { drawEnemiesGraphics } from "@/arena/enemies";
import { drawKeysGraphics } from "@/arena/keys";
import { drawPowerUpsGraphics } from "@/arena/powerUps";
import { actions as commandForgeActions } from "@/strategy-sandbox/command-forge/actions";
import hotkeys from "hotkeys-js";

function initializeKeybindings() {
  hotkeys.filter = function (e) {
    const target = e.target;
    const tagName = (target as HTMLElement)?.tagName;

    return !(tagName === "SL-INPUT");
  };

  hotkeys("h,left,esc", commandForgeActions.exitFocusedShard);
  hotkeys("l,right,enter", commandForgeActions.enterFocusedShard);
  hotkeys("j,down", commandForgeActions.focusNextSiblingShard);
  hotkeys("k,up", commandForgeActions.focusPreviousSiblingShard);
  hotkeys("a", commandForgeActions.addShardInFrontOfFocusedShardAndFocus);
  hotkeys("i", commandForgeActions.addShardBehindFocusedShardAndFocus);
  hotkeys("d", commandForgeActions.deleteFocusedShard);
  hotkeys("b", commandForgeActions.toggleFocusedShardDisplayStyle);
  hotkeys("t", commandForgeActions.toggleFocusedShardType);
  hotkeys("e", commandForgeActions.executeFocusedStatements);
  hotkeys("space", commandForgeActions.toggleGameLoopPlayingState);
}

export async function initializeGame(canvas?: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    autoStart: true,
    background: getCSSVariable("--sl-color-neutral-0"),
    canvas,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
  });

  app.stage.addChild(mazeLayer);
  app.stage.addChild(mazeGraphics);

  drawPowerUpsGraphics(app.stage);
  drawKeysGraphics(app.stage);
  drawEnemiesGraphics(app.stage);
  drawPlayerGraphics(app.stage);

  initializeKeybindings();

  app.ticker.add(() => {
    // update playerGraphics
    // update maze
    // update enemy graphics
    // update powerUp graphics
  });
}
