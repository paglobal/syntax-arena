import {
  enemyKinds,
  INITIAL_ARENA_COLUMN_COUNT,
  INITIAL_ARENA_ROW_COUNT,
  INITIAL_ENEMY_COUNT,
  randomIntegerFromRange,
} from "@/utils";
import { EnemyState } from "./enemies";
import { adaptState, State } from "promethium-js";

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
