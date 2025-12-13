import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";
import { ARENA_CELL_SIZE, MID_POINT } from "./constants";
import { EnemyKind } from "@/utils";

export type EnemyState = {
  kind: EnemyKind;
  position: { x: number; y: number };
};

const [enemiesState] = adaptState<Array<EnemyState>>([
  { kind: "blueEnemy", position: { x: 5, y: 6 } },
  { kind: "blueEnemy", position: { x: 2, y: 4 } },
]);

export function drawEnemiesGraphics(container: Container) {
  const enemiesLayer = new RenderLayer();
  container.addChild(enemiesLayer);
  adaptSyncEffect(() => {
    const _enemiesState = enemiesState();
    for (const enemyState of _enemiesState) {
      const enemySprite = new Sprite({
        texture: Assets.get(enemyState.kind),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      container.addChild(enemySprite);
      enemiesLayer.attach(enemySprite);
      const ratio = enemySprite.height / enemySprite.width;
      enemySprite.position.set(
        ARENA_CELL_SIZE * (enemyState.position.x + MID_POINT),
        ARENA_CELL_SIZE * (enemyState.position.y + MID_POINT),
      );
      enemySprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
    }
  });
}
