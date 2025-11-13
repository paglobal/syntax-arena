import { imperativeUpdate, Setter } from "promethium-js";
import { Assets } from "pixi.js";

export const ARENA_CELL_SIZE = 50;
export const INITIAL_ARENA_ROW_COUNT = 10;
export const INITIAL_ARENA_COLUMN_COUNT = 10;
export const INITIAL_ENEMY_COUNT = 5;
export const INITIAL_KEY_COUNT = 5;
export const INITIAL_POWER_UP_COUNT = 5;
export const ARENA_WALL_THICKNESS = 5;
export const MID_POINT = 0.5;

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

export const CANVAS_CONTAINER_ID = "canvas-container";

export function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

export function replaceInArray<T>({
  array,
  oldItem,
  newItem,
}: {
  array: T[];
  oldItem: T;
  newItem: T;
}): boolean {
  const index = array.indexOf(oldItem);

  if (index === -1) return false;
  array[index] = newItem;

  return true;
}

export function getCSSVariable(variableName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

export function mutateState<T>(
  fn: (...args: any[]) => any,
  setState: Setter<T>,
) {
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

// Implementation of xoshiroo**: translated by ChatGPT
function rotl(x: number, k: number) {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

// splitMix32 — recommended seeder for xoshiro
function splitmix32(seed: number) {
  let x = seed >>> 0;
  return function () {
    x = (x + 0x9e3779b9) >>> 0;
    let z = x;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

// Factory: xoshiro128** RNG
function xoshiro128ss(a: number, b: number, c: number, d: number) {
  const s = new Uint32Array([a >>> 0, b >>> 0, c >>> 0, d >>> 0]);

  // Core next() function — returns unsigned 32-bit int
  function nextUint32() {
    const result = Math.imul(rotl(Math.imul(s[1], 5) >>> 0, 7), 9) >>> 0;

    const t = (s[1] << 9) >>> 0;

    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];

    s[2] ^= t;
    s[3] = rotl(s[3], 11);

    return result >>> 0;
  }

  // Jump: equivalent to 2^64 calls to next()
  function jump() {
    const JUMP = [0x8764000b, 0xf542d2d3, 0x6fa035c3, 0x77f2db5b];
    let s0 = 0,
      s1 = 0,
      s2 = 0,
      s3 = 0;

    for (let i = 0; i < 4; i++) {
      for (let b = 0; b < 32; b++) {
        if (JUMP[i] & (1 << b)) {
          s0 ^= s[0];
          s1 ^= s[1];
          s2 ^= s[2];
          s3 ^= s[3];
        }
        nextUint32();
      }
    }

    s[0] = s0 >>> 0;
    s[1] = s1 >>> 0;
    s[2] = s2 >>> 0;
    s[3] = s3 >>> 0;
  }

  // Long Jump: equivalent to 2^96 calls to next()
  function longJump() {
    const LJUMP = [0xb523952e, 0x0b6f099f, 0xccf5a0ef, 0x1c580662];
    let s0 = 0,
      s1 = 0,
      s2 = 0,
      s3 = 0;

    for (let i = 0; i < 4; i++) {
      for (let b = 0; b < 32; b++) {
        if (LJUMP[i] & (1 << b)) {
          s0 ^= s[0];
          s1 ^= s[1];
          s2 ^= s[2];
          s3 ^= s[3];
        }
        nextUint32();
      }
    }

    s[0] = s0 >>> 0;
    s[1] = s1 >>> 0;
    s[2] = s2 >>> 0;
    s[3] = s3 >>> 0;
  }

  // Public API
  return {
    nextUint32,
    nextFloat: () => nextUint32() / 4294967296,
    jump,
    longJump,
    get state() {
      return Array.from(s);
    },
    set state(arr) {
      for (let i = 0; i < 4; i++) s[i] = arr[i] >>> 0;
    },
  };
}

// Convenience wrapper to seed from one integer
export function xoshiro128ssFromSeed(seed: number) {
  const sm = splitmix32(seed);
  return xoshiro128ss(sm(), sm(), sm(), sm());
}
