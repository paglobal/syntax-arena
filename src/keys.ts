import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State } from "promethium-js";
import { ARENA_CELL_SIZE, assetAliases, MID_POINT } from "./constants";

const [keysState] = adaptState<
  State<{
    position: { x: number; y: number };
  }>[]
>([
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 5, y: 6 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 2, y: 5 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 1, y: 3 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 5, y: 0 } }),
  adaptState<{
    position: { x: number; y: number };
  }>({ position: { x: 1, y: 7 } }),
]);

export function drawKeysGraphics(stage: Container) {
  const keysLayer = new RenderLayer();
  stage.addChild(keysLayer);

  adaptSyncEffect(() => {
    const _keysState = keysState();
    for (const keyStateTuple of _keysState) {
      const keySprite = new Sprite({
        texture: Assets.get(assetAliases.objects.key),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      keysLayer.attach(keySprite);
      stage.addChild(keySprite);

      adaptSyncEffect(() => {
        const _keyState = keyStateTuple[0]();
        const ratio = keySprite.height / keySprite.width;
        const scaleFactor = 0.6;
        keySprite.position.set(
          ARENA_CELL_SIZE * (_keyState.position.x + MID_POINT),
          ARENA_CELL_SIZE * (_keyState.position.y + MID_POINT),
        );
        keySprite.setSize(
          ARENA_CELL_SIZE * scaleFactor,
          ARENA_CELL_SIZE * scaleFactor * ratio,
        );
      });
    }
  });
}

function updateKeysState() {}
