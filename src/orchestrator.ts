import { mazeGraphics, mazeLayer } from "./maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "./constants";
import { adaptMemo, adaptState } from "promethium-js";
import { drawPlayerGraphics } from "./player";
import { getCSSVariable } from "./renderUtils";
import { drawEnemiesGraphics } from "./enemies";
import { drawKeysGraphics } from "./keys";
import { drawPowerUpsGraphics } from "./powerUps";
import { Program } from "./interpreter";
import { keybindingUtils, programUtils } from "./orchestratorUtils";
import hotkeys from "hotkeys-js";

export const [orchestratorState, setOrchestratorState] = adaptState({
  level: 1,
  currentStatementsIndex: 0,
  playing: false,
});

const [program] = adaptState<Program>([
  programUtils.generateStatements(),
]);

export const currentStatements = adaptMemo(() => {
  return program()[orchestratorState().currentStatementsIndex];
});

function initializeKeybindings() {
  hotkeys("h,left", keybindingUtils.exitCurrentShard);
  hotkeys("l,right", keybindingUtils.enterCurrentShard);
  hotkeys("j,down", keybindingUtils.focusNextSiblingShard);
  hotkeys("k,up", keybindingUtils.focusPreviousSiblingShard);
  hotkeys("a", keybindingUtils.addShardInFrontOfCurrentShardAndFocus);
  hotkeys("i", keybindingUtils.addShardBehindCurrentShardAndFocus);
  hotkeys("d", keybindingUtils.deleteCurrentShard);
  hotkeys("b", keybindingUtils.toggleCurrentShardDisplayState);
  hotkeys("t", keybindingUtils.toggleCurrentShardType);
  hotkeys("e", keybindingUtils.executeCurrentStatements);
  hotkeys("space", keybindingUtils.toggleGameLoopPlayingState);
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
