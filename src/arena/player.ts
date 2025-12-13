import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { playerKinds } from "@/utils";
import { timingFunctions, tween, TweenEventCallback } from "./animation";
import { Position } from "./types";

const [playerState, setPlayerState] = adaptState<{ position: Position }>({
  position: { x: 9, y: 5 },
});

const playerTweenObject = tween({
  duration: 1000,
});

const FLOATING_DISPLACEMENT = 0.025;

const float = ({ progress }: Parameters<TweenEventCallback<"update">>[0]) => {
  playerActions.setPlayerPositionY(
    timingFunctions.easeInOutCubic({ from: 5, to: 9, value: progress }),
  );
};

const moveToLocation = () => {};

playerTweenObject.on("update", float);
playerTweenObject.on("complete", () => {});

export const playerActions = {
  getPlayerState() {
    return playerState();
  },
  setPlayerPosition(newPosition: Position) {
    const playerState = playerActions.getPlayerState();
    setPlayerState({
      ...playerState,
      position: { ...newPosition },
    });
  },
  setPlayerPositionX(newPositionX: number) {
    const playerState = playerActions.getPlayerState();
    setPlayerState({
      ...playerState,
      position: {
        ...playerState.position,
        x: newPositionX,
      },
    });
  },
  setPlayerPositionY(newPositionY: number) {
    console.log(newPositionY);
    const playerState = playerActions.getPlayerState();
    setPlayerState({
      ...playerState,
      position: {
        ...playerState.position,
        y: newPositionY,
      },
    });
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
    const _playerState = playerState();
    const ratio = playerSprite.height / playerSprite.width;
    playerSprite.position.set(
      ARENA_CELL_SIZE * (_playerState.position.x + MID_POINT),
      ARENA_CELL_SIZE * (_playerState.position.y + MID_POINT),
    );
    playerSprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
  });
  playerTweenObject.play();
}
