import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { objectKinds } from "@/utils";

const [keysState] = adaptState<
  Array<{
    position: { x: number; y: number };
  }>
>([
  { position: { x: 5, y: 6 } },
  { position: { x: 2, y: 5 } },
  { position: { x: 1, y: 3 } },
  { position: { x: 5, y: 0 } },
  { position: { x: 1, y: 7 } },
]);

export function drawKeysGraphics(container: Container) {
  const keysLayer = new RenderLayer();
  container.addChild(keysLayer);
  adaptSyncEffect(() => {
    const _keysState = keysState();
    for (const keyState of _keysState) {
      const keySprite = new Sprite({
        texture: Assets.get(objectKinds.key),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      container.addChild(keySprite);
      keysLayer.attach(keySprite);
      const ratio = keySprite.height / keySprite.width;
      const scaleFactor = 0.6;
      keySprite.position.set(
        ARENA_CELL_SIZE * (keyState.position.x + MID_POINT),
        ARENA_CELL_SIZE * (keyState.position.y + MID_POINT),
      );
      keySprite.setSize(
        ARENA_CELL_SIZE * scaleFactor,
        ARENA_CELL_SIZE * scaleFactor * ratio,
      );
    }
  });
}
