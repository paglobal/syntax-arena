import { imperativeUpdate, Setter } from "promethium-js";
import { Assets } from "pixi.js";

export const entityKinds = {
  characters: "characters",
  objects: "objects",
} as const satisfies Record<string, string>;

export type EntityKind = (typeof entityKinds)[keyof typeof entityKinds];

export const enemyKinds = {
  blueEnemy: "blueEnemy",
  redEnemy: "redEnemy",
  orangeEnemy: "orangeEnemy",
  greenEnemy: "greenEnemy",
} as const satisfies Record<string, string>;

export type EnemyKind = (typeof enemyKinds)[keyof typeof enemyKinds];

export const playerKinds = {
  player: "player",
} as const satisfies Record<string, string>;

export type PlayerKind = (typeof playerKinds)[keyof typeof playerKinds];

export const objectKinds = {
  powerUp: "powerUp",
  key: "key",
} as const satisfies Record<string, string>;

export type ObjectKind = (typeof objectKinds)[keyof typeof objectKinds];

const assetFileTree = {
  characters: {
    ...playerKinds,
    ...enemyKinds,
  },
  objects: {
    ...objectKinds,
  },
} as const satisfies Record<
  EntityKind,
  Record<string, EnemyKind | PlayerKind | ObjectKind>
>;

function getSVGAssetObject(folder: EntityKind, alias: string) {
  return { alias, src: `/assets/${folder}/${alias}.svg` };
}

export async function loadAssetBundle(folder: EntityKind) {
  const assetArray = Object.values(assetFileTree[folder]).map((alias) =>
    getSVGAssetObject(folder, alias),
  );
  Assets.addBundle(folder, assetArray);
  await Assets.loadBundle(folder);
}

export function assertNever(x: never, message?: string): never {
  throw new Error(message ?? "Unexpected value:" + x);
}

export function mutateState<T>({
  fn,
  setState,
}: {
  fn: (...args: any[]) => any;
  setState: Setter<T>;
}) {
  fn();
  setState(imperativeUpdate);
}

export function randomIntegerFromRange(start: number, end: number) {
  if (end > start) {
    return Math.floor(Math.random() * (end + 1 - start)) + start;
  } else {
    throw new Error("End must be greater than start!");
  }
}
