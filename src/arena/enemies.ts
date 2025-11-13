import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State, untrack } from "promethium-js";
import { ARENA_CELL_SIZE, EnemyKind, MID_POINT } from "@/utils";
import { getInitialEnemiesState } from "./enemiesUtils";

export type EnemyState = {
  kind: EnemyKind;
  position: { x: number; y: number };
};

const [enemiesState] = adaptState<Array<State<EnemyState>>>(
  getInitialEnemiesState(),
);

export function drawEnemiesGraphics(container: Container) {
  const enemiesLayer = new RenderLayer();
  container.addChild(enemiesLayer);
  adaptSyncEffect(() => {
    const _enemiesState = enemiesState();
    for (const enemyStateTuple of _enemiesState) {
      const enemySprite = new Sprite({
        texture: Assets.get(untrack(enemyStateTuple[0]).kind),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      container.addChild(enemySprite);
      enemiesLayer.attach(enemySprite);
      adaptSyncEffect(() => {
        const _enemyState = enemyStateTuple[0]();
        const ratio = enemySprite.height / enemySprite.width;
        enemySprite.position.set(
          ARENA_CELL_SIZE * (_enemyState.position.x + MID_POINT),
          ARENA_CELL_SIZE * (_enemyState.position.y + MID_POINT),
        );
        enemySprite.setSize(ARENA_CELL_SIZE, ARENA_CELL_SIZE * ratio);
      });
    }
  });
}
