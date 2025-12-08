import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { objectKinds } from "@/utils";

const [powerUpsState] = adaptState<
  Array<{
    position: { x: number; y: number };
  }>
>([
  { position: { x: 2, y: 7 } },
  { position: { x: 3, y: 2 } },
  { position: { x: 2, y: 8 } },
  { position: { x: 7, y: 2 } },
  { position: { x: 0, y: 4 } },
]);

export function drawPowerUpsGraphics(container: Container) {
  const powerUpsLayer = new RenderLayer();
  container.addChild(powerUpsLayer);
  adaptSyncEffect(() => {
    const _powerUpsState = powerUpsState();
    for (const powerUpState of _powerUpsState) {
      const powerUpSprite = new Sprite({
        texture: Assets.get(objectKinds.powerUp),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      container.addChild(powerUpSprite);
      powerUpsLayer.attach(powerUpSprite);
      const ratio = powerUpSprite.height / powerUpSprite.width;
      const scaleFactor = 0.8;
      powerUpSprite.position.set(
        ARENA_CELL_SIZE * (powerUpState.position.x + MID_POINT),
        ARENA_CELL_SIZE * (powerUpState.position.y + MID_POINT),
      );
      powerUpSprite.setSize(
        ARENA_CELL_SIZE * scaleFactor,
        ARENA_CELL_SIZE * scaleFactor * ratio,
      );
    }
  });
}
