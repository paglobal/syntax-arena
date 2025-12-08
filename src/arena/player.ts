import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, untrack } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { playerKinds } from "@/utils";
import { animate } from "animejs";

const [playerState, setPlayerState] = adaptState({
  position: { x: 9, y: 5 },
});

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
  const initialPlayerPositionY = untrack(playerState).position.y;
  animate(
    { y: initialPlayerPositionY },
    {
      y: ["-=0.10", "+=0.10", "+=0.10"],
      duration: 1500,
      playbackEase: "out(1)",
      loop: true,
      alternate: true,
      onUpdate(self) {
        const y = (self.targets[0] as { y: number }).y;
        const _playerState = playerState();
        setPlayerState({
          ..._playerState,
          position: { ..._playerState.position, y },
        });
      },
    },
  );
  adaptSyncEffect(() => {
    const _playerState = playerState();
    const ratio = playerSprite.height / playerSprite.width;
    playerSprite.position.set(
      ARENA_CELL_SIZE * (_playerState.position.x + MID_POINT),
      ARENA_CELL_SIZE * (_playerState.position.y + MID_POINT),
    );
    playerSprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
  });
}
