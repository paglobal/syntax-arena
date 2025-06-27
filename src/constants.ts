export const ARENA_CELL_SIZE = 80;
export const ARENA_ROW_COUNT = 10;
export const ARENA_COLUMN_COUNT = 8;
export const ARENA_WIDTH = ARENA_COLUMN_COUNT * ARENA_CELL_SIZE;
export const ARENA_HEIGHT = ARENA_ROW_COUNT * ARENA_CELL_SIZE;
export const ARENA_WALL_THICKNESS = 5;
export const MID_POINT = 0.5;

export const assetFolders = {
  characters: "characters",
  objects: "objects",
} as const satisfies Record<string, string>;

export const assetAliases = {
  characters: {
    player: "player",
    blueEnemy: "blueEnemy",
    redEnemy: "redEnemy",
    orangeEnemy: "orangeEnemy",
    greenEnemy: "greenEnemy",
  },
  objects: {
    powerUp: "powerUp",
    key: "key",
  },
} as const satisfies Record<string, Record<string, string>>;

export type EnemyKind = Exclude<
  keyof (typeof assetAliases)["characters"],
  "player"
>;
