import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { playerKinds } from "@/utils";
import { timingFunctions, tween, TweenEventCallback } from "./animation";
import { Position } from "./types";
import { FLOATING_DISPLACEMENT } from "./constants";

const [getPlayerState, setPlayerState] = adaptState<{ position: Position }>({
  position: { x: 9, y: 5 },
});

function setPlayerPosition(newPosition: Partial<Position>) {
  const playerState = getPlayerState();
  setPlayerState({
    ...playerState,
    position: { ...playerState.position, ...newPosition },
  });
}

const playerTweenObject = tween({
  duration: 1000,
});

function moveToYPosition(
  newY: number,
  onComplete?: TweenEventCallback<"complete">,
) {
  playerTweenObject.reset();
  const playerPosition = playerActions.getPlayerPosition();
  playerTweenObject.on("update", ({ progress }) => {
    setPlayerPosition({
      y: timingFunctions.easeInOutSine({
        from: playerPosition.y,
        to: newY,
        value: progress,
      }),
    });
  });
  playerTweenObject.on("complete", onComplete ?? float);
  playerTweenObject.play();
}

function float() {
  playerTweenObject.reset();
  const playerPosition = playerActions.getPlayerPosition();
  playerTweenObject.on("update", ({ progress }) => {
    setPlayerPosition({
      y: timingFunctions.easeInOutSine({
        from: Math.round(playerPosition.y) - FLOATING_DISPLACEMENT,
        to: Math.round(playerPosition.y) + FLOATING_DISPLACEMENT,
        value: progress,
      }),
    });
  });
  playerTweenObject.on("complete", () => {
    playerTweenObject.reverse();
    playerTweenObject.play();
  });
  playerTweenObject.play();
}

export const playerActions = {
  getPlayerPosition() {
    return getPlayerState().position;
  },
  moveDown() {
    const playerPosition = playerActions.getPlayerPosition();
    moveToYPosition(
      Math.round(playerPosition.y) + 1 + FLOATING_DISPLACEMENT,
      () => {
        const playerPosition = playerActions.getPlayerPosition();
        moveToYPosition(playerPosition.y - 2 * FLOATING_DISPLACEMENT);
      },
    );
  },
  moveUp() {
    const playerPosition = playerActions.getPlayerPosition();
    moveToYPosition(Math.round(playerPosition.y) - 1 - FLOATING_DISPLACEMENT);
  },
};

export function drawPlayerGraphics(container: Container) {
  const playerLayer = new RenderLayer();
  container.addChild(playerLayer);
  const playerSprite = new Sprite({
    texture: Assets.get(playerKinds.player),
    anchor: MID_POINT,
    pivot: MID_POINT,
  });
  container.addChild(playerSprite);
  playerLayer.attach(playerSprite);
  adaptSyncEffect(() => {
    const _playerState = getPlayerState();
    const ratio = playerSprite.height / playerSprite.width;
    playerSprite.position.set(
      ARENA_CELL_SIZE * (_playerState.position.x + MID_POINT),
      ARENA_CELL_SIZE * (_playerState.position.y + MID_POINT),
    );
    playerSprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
  });
  const playerPosition = playerActions.getPlayerPosition();
  moveToYPosition(playerPosition.y - FLOATING_DISPLACEMENT);
}
