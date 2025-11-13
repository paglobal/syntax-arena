import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import { ARENA_CELL_SIZE, assetAliases, MID_POINT } from "@/constants";

const [playerState] = adaptState({
  position: { x: 1, y: 9 },
});

export function drawPlayerGraphics(container: Container) {
  const playerLayer = new RenderLayer();
  container.addChild(playerLayer);
  const playerSprite = new Sprite({
    texture: Assets.get(assetAliases.characters.player),
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
}
