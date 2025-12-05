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

export function bfSearcher<T>({
  start,
  getNodeNeighbors,
  nodeAction,
}: {
  start: T;
  getNodeNeighbors: (node: T) => T[];
  nodeAction: ({ current, next }: { current: T; next: T }) => void;
}) {
  const frontier = [];
  frontier.push(start);
  const cameFrom = new Map<T, T | null>();
  cameFrom.set(start, null);
  while (true) {
    const current = frontier.shift();
    if (current === undefined) {
      break;
    }
    const neighbors = getNodeNeighbors(current);
    for (const next of neighbors) {
      nodeAction({ current, next: next });
      if (cameFrom.get(next) === undefined) {
        frontier.push(next);
        cameFrom.set(next, current);
      }
    }
  }
}
