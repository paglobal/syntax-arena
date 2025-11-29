import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State, untrack } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  MID_POINT,
  INITIAL_ARENA_COLUMN_COUNT,
  INITIAL_ARENA_ROW_COUNT,
  INITIAL_ENEMY_COUNT,
} from "./constants";
import { enemyKinds, EnemyKind, randomIntegerFromRange } from "@/utils";

export function getInitialEnemiesState() {
  const initialEnemiesState: Array<State<EnemyState>> = [];
  const enemyKindsArray = Object.values(enemyKinds);
  for (let i = 0; i < INITIAL_ENEMY_COUNT; i++) {
    const enemyState = adaptState<EnemyState>({
      kind: enemyKindsArray[
        randomIntegerFromRange(0, enemyKindsArray.length - 1)
      ],
      position: {
        x: randomIntegerFromRange(0, INITIAL_ARENA_COLUMN_COUNT - 1),
        y: randomIntegerFromRange(0, INITIAL_ARENA_ROW_COUNT - 1),
      },
    });
    initialEnemiesState.push(enemyState);
  }

  return initialEnemiesState;
}

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
