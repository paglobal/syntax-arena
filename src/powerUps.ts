import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State } from "promethium-js";
import { ARENA_CELL_SIZE, assetAliases, MID_POINT } from "./constants";

const [powerUpsState, powerUpsKeysState] = adaptState<
  State<{
    position: { x: number; y: number };
  }>[]
>([
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 2, y: 7 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 3, y: 2 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 2, y: 8 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 7, y: 2 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 0, y: 4 } }),
]);

export function drawPowerUpsGraphics(stage: Container) {
  const powerUpsLayer = new RenderLayer();
  stage.addChild(powerUpsLayer);

  adaptSyncEffect(() => {
    const _powerUpsState = powerUpsState();
    for (const powerUpStateTuple of _powerUpsState) {
      const powerUpSprite = new Sprite({
        texture: Assets.get(assetAliases.objects.powerUp),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      powerUpsLayer.attach(powerUpSprite);
      stage.addChild(powerUpSprite);

      adaptSyncEffect(() => {
        const _powerUpState = powerUpStateTuple[0]();
        const ratio = powerUpSprite.height / powerUpSprite.width;
        powerUpSprite.position.set(
          ARENA_CELL_SIZE * (_powerUpState.position.x + MID_POINT),
          ARENA_CELL_SIZE * (_powerUpState.position.y + MID_POINT),
        );
        powerUpSprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
      });
    }
  });
}

function updateKeysState() {}
