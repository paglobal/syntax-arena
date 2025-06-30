import { Assets, Container, RenderLayer, Sprite } from "pixi.js";
import { adaptState, adaptSyncEffect, State, untrack } from "promethium-js";
import {
  ARENA_CELL_SIZE,
  assetAliases,
  EnemyKind,
  MID_POINT,
} from "./constants";

const [enemiesState] = adaptState<
  State<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>[]
>([
  adaptState<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>({ kind: "blueEnemy", position: { x: 2, y: 6 } }),
  adaptState<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>({ kind: "greenEnemy", position: { x: 7, y: 5 } }),
  adaptState<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>({ kind: "redEnemy", position: { x: 1, y: 1 } }),
  adaptState<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>({ kind: "orangeEnemy", position: { x: 1, y: 2 } }),
  adaptState<{
    kind: EnemyKind;
    position: { x: number; y: number };
  }>({ kind: "blueEnemy", position: { x: 4, y: 4 } }),
]);

export function drawEnemiesGraphics(stage: Container) {
  const enemiesLayer = new RenderLayer();
  stage.addChild(enemiesLayer);

  adaptSyncEffect(() => {
    const _enemiesState = enemiesState();
    for (const enemyStateTuple of _enemiesState) {
      const enemySprite = new Sprite({
        texture: Assets.get(
          assetAliases.characters[untrack(enemyStateTuple[0]).kind],
        ),
        anchor: MID_POINT,
        pivot: MID_POINT,
      });
      enemiesLayer.attach(enemySprite);
      stage.addChild(enemySprite);

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

function updateEnemiesState() {}
