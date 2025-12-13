export type TweenEventMap = {
  play: [];
  pause: [];
  stop: [];
  reverse: [{ direction: TweenDirection }];
  update: [{ progress: number; elapsedTime: number }];
  beforeTick: [];
  afterTick: [{ progress: number; elapsedTime: number }];
  complete: [{ progress: number; elapsedTime: number }];
};

export type TweenEventName = keyof TweenEventMap;

export type TweenEventCallback<T extends TweenEventName> = (
  ...args: TweenEventMap[T]
) => void;

type TweenDirection = "forward" | "reverse";

export function clamp({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}): number {
  return Math.min(Math.max(value, min), max);
}

export function tween(parameters: { duration: number }) {
  const tweenInstance = {
    on<T extends TweenEventName>(
      eventName: T,
      callback: TweenEventCallback<T>,
    ) {
      if (!eventListeners[eventName]) {
        eventListeners[eventName] = [];
      }
      eventListeners[eventName].push(callback);

      return () => {
        const listeners: TweenEventCallback<T>[] =
          eventListeners[eventName] ?? [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    once<T extends TweenEventName>(
      eventName: T,
      callback: TweenEventCallback<T>,
    ) {
      const unsubscribe = tweenInstance.on(eventName, (...args) => {
        callback(...args);
        unsubscribe();
      });

      return unsubscribe();
    },
    off<T extends TweenEventName>(
      eventName: T,
      callback: TweenEventCallback<T>,
    ) {
      if (!eventListeners[eventName]) {
        return;
      }
      if (callback) {
        const listeners = eventListeners[eventName]!;
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      } else {
        delete eventListeners[eventName];
      }
    },
    play() {
      state = "playing";
      emitEvent("play");
      requestAnimationFrame(tick);
    },
    pause() {
      state = "paused";
      emitEvent("pause");
    },
    stop() {
      state = "inactive";
      startTime = null;
      emitEvent("stop");
    },
    restart() {
      tweenInstance.stop();
      tweenInstance.play();
    },
    reverse() {
      referenceTime = currentTime;
      direction = direction === "forward" ? "reverse" : "forward";
      emitEvent("reverse", { direction });
    },
  };
  const eventListeners: Partial<
    Record<TweenEventName, ((...args: any[]) => void)[]>
  > = {};
  let startTime: number | null = null;
  let referenceTime: number | null = null;
  let state: "playing" | "paused" | "inactive" = "inactive";
  let direction: TweenDirection = "forward";
  let currentTime: number;

  function emitEvent<T extends TweenEventName>(
    eventName: T,
    ...args: TweenEventMap[T]
  ) {
    const listeners = eventListeners[eventName] ?? [];
    listeners.forEach((listener) => listener(...args));
  }

  function tick(timestamp: number) {
    if (state === "inactive" || state === "paused") {
      return;
    }
    emitEvent("beforeTick");
    currentTime = timestamp;
    if (startTime === null || referenceTime === null) {
      startTime = currentTime;
      referenceTime = startTime;
    }
    const delta =
      direction === "forward"
        ? currentTime - referenceTime
        : referenceTime - currentTime;
    const gapFromStartTimeToReferenceTime = referenceTime - startTime;
    const elapsedTime = gapFromStartTimeToReferenceTime + delta;
    let progress = clamp({
      value: elapsedTime / parameters.duration,
      min: 0,
      max: 1,
    });
    emitEvent("update", { progress, elapsedTime });
    if (
      (direction === "forward" && progress >= 1) ||
      (direction === "reverse" && progress <= 0)
    ) {
      tweenInstance.pause();
      emitEvent("complete", { progress, elapsedTime });
    } else {
      requestAnimationFrame(tick);
    }
    emitEvent("afterTick", { progress, elapsedTime });
  }

  return tweenInstance;
}

function isInRequiredRange({
  from,
  to,
  value,
}: {
  from: number;
  to: number;
  value: number;
}): boolean {
  return value >= from && value <= to;
}

// This takes a any value in a certain provided range (in) and uses it peg a value in another provided range (out)
export function remap({
  fromIn,
  toIn,
  fromOut,
  toOut,
  value,
  strictRange = false,
}: {
  fromIn: number;
  toIn: number;
  fromOut: number;
  toOut: number;
  value: number;
  strictRange?: boolean;
}) {
  if (strictRange && !isInRequiredRange({ from: fromIn, to: toIn, value })) {
    throw new Error(`${value} must be between ${fromIn} and ${toIn}`);
  }

  return fromOut + ((value - fromIn) * (toOut - fromOut)) / (toIn - fromIn);
}

// This takes a normalized value (from 0 to 1) and uses it peg a value in a provided range
export function map({
  from,
  to,
  value,
  strictRange = false,
}: {
  from: number;
  to: number;
  value: number;
  strictRange?: boolean;
}) {
  return remap({
    fromIn: 0,
    toIn: 1,
    fromOut: from,
    toOut: to,
    value,
    strictRange,
  });
}

export interface TimingFunction {
  (parameters: {
    value: number;
    from?: number;
    to?: number;
    s?: number;
    n?: number;
    v?: number;
    d?: number;
  }): number;
}

const easeOutBounce: TimingFunction = ({
  from = 0,
  to = 1,
  value,
  n = 7.5625,
  d = 2.75,
}) => {
  if (value < 1 / d) {
    value = n * value * value;
  } else if (value < 2 / d) {
    value = n * (value -= 1.505 / d) * value + 0.75;
  } else if (value < 2.5 / d) {
    value = n * (value -= 2.25 / d) * value + 0.9375;
  } else {
    value = n * (value -= 2.625 / d) * value + 0.984375;
  }

  return map({ from, to, value });
};

export const timingFunctions = {
  sine({ from = 0, to = 1, value }) {
    return remap({
      fromIn: -1,
      toIn: 1,
      fromOut: from,
      toOut: to,
      value: Math.sin(value),
    });
  },
  easeInSine({ from = 0, to = 1, value }) {
    value = 1 - Math.cos((value * Math.PI) / 2);

    return map({ from, to, value });
  },
  easeOutSine({ from = 0, to = 1, value }) {
    value = Math.sin((value * Math.PI) / 2);

    return map({ from, to, value });
  },
  easeInOutSine({ from = 0, to = 1, value }) {
    value = -(Math.cos(Math.PI * value) - 1) / 2;

    return map({ from, to, value });
  },
  easeInQuad({ from = 0, to = 1, value }) {
    value = value * value;

    return map({ from, to, value });
  },
  easeOutQuad({ from = 0, to = 1, value }) {
    value = 1 - Math.pow(1 - value, 2);

    return map({ from, to, value });
  },
  easeInOutQuad({ from = 0, to = 1, value }) {
    value =
      value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

    return map({ from, to, value });
  },
  easeInCubic({ from = 0, to = 1, value }) {
    value = value * value * value;

    return map({ from, to, value });
  },
  easeOutCubic({ from = 0, to = 1, value }) {
    value = 1 - Math.pow(1 - value, 3);

    return map({ from, to, value });
  },
  easeInOutCubic({ from = 0, to = 1, value }) {
    value =
      value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;

    return map({ from, to, value });
  },
  easeInQuart({ from = 0, to = 1, value }) {
    value = value * value * value * value;

    return map({ from, to, value });
  },
  easeOutQuart({ from = 0, to = 1, value }) {
    value = 1 - Math.pow(1 - value, 4);

    return map({ from, to, value });
  },
  easeInOutQuart({ from = 0, to = 1, value }) {
    value =
      value < 0.5
        ? 8 * value * value * value * value
        : 1 - Math.pow(-2 * value + 2, 4) / 2;

    return map({ from, to, value });
  },
  easeInQuint({ from = 0, to = 1, value }) {
    value = value * value * value * value * value;

    return map({ from, to, value });
  },
  easeOutQuint({ from = 0, to = 1, value }) {
    value = 1 - Math.pow(1 - value, 5);

    return map({ from, to, value });
  },
  easeInOutQuint({ from = 0, to = 1, value }) {
    value =
      value < 0.5
        ? 16 * value * value * value * value * value
        : 1 - Math.pow(-2 * value + 2, 5) / 2;

    return map({ from, to, value });
  },
  easeInExpo({ from = 0, to = 1, value }) {
    value = value === 0 ? 0 : Math.pow(2, 10 * value - 10);

    return map({ from, to, value });
  },
  easeOutExpo({ from = 0, to = 1, value }) {
    value = value === 1 ? 1 : 1 - Math.pow(2, -10 * value);

    return map({ from, to, value });
  },
  easeInOutExpo({ from = 0, to = 1, value }) {
    value =
      value === 0
        ? 0
        : value === 1
          ? 1
          : value < 0.5
            ? Math.pow(2, 20 * value - 10) / 2
            : (2 - Math.pow(2, -20 * value + 10)) / 2;

    return map({ from, to, value });
  },
  easeInCirc({ from = 0, to = 1, value }) {
    value = 1 - Math.sqrt(1 - Math.pow(value, 2));

    return map({ from, to, value });
  },
  easeOutCirc({ from = 0, to = 1, value }) {
    value = Math.sqrt(1 - Math.pow(value - 1, 2));

    return map({ from, to, value });
  },
  easeInOutCirc({ from = 0, to = 1, value }) {
    value =
      value < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * value, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * value + 2, 2)) + 1) / 2;

    return map({ from, to, value });
  },
  easeInBack({ from = 0, to = 1, value, s = 1.70158 }) {
    value = (s + 1) * value * value * value - s * value * value;

    return map({ from, to, value });
  },
  easeOutBack({ from = 0, to = 1, value, s = 1.70158 }) {
    value = 1 + (s + 1) * Math.pow(value - 1, 3) + s * Math.pow(value - 1, 2);

    return map({ from, to, value });
  },
  easeInOutBack({ from = 0, to = 1, value, s = 1.70158, v = 1.525 }) {
    value =
      value < 0.5
        ? (Math.pow(2 * value, 2) * ((s * v + 1) * 2 * value - s * v)) / 2
        : (Math.pow(2 * value - 2, 2) *
            ((s * v + 1) * (value * 2 - 2) + s * v) +
            2) /
          2;

    return map({ from, to, value });
  },
  easeInElastic({ from = 0, to = 1, value, s = 2.094395 }) {
    value =
      value === 0
        ? 0
        : value === 1
          ? 1
          : -Math.pow(2, 10 * value - 10) * Math.sin((value * 10 - 10.75) * s);

    return map({ from, to, value });
  },
  easeOutElastic({ from = 0, to = 1, value, s = 2.094395 }) {
    value =
      value === 0
        ? 0
        : value === 1
          ? 1
          : Math.pow(2, -10 * value) * Math.sin((value * 10 - 0.75) * s) + 1;

    return map({ from, to, value });
  },
  easeInOutElastic({ from = 0, to = 1, value, s = 1.39626 }) {
    value =
      value === 0
        ? 0
        : value === 1
          ? 1
          : value < 0.5
            ? -(
                Math.pow(2, 20 * value - 10) *
                Math.sin((20 * value - 11.125) * s)
              ) / 2
            : (Math.pow(2, -20 * value + 10) *
                Math.sin((20 * value - 11.125) * s)) /
                2 +
              1;

    return map({ from, to, value });
  },
  easeInBounce({ from = 0, to = 1, value, n = 7.5625, d = 2.75 }) {
    return 1 - easeOutBounce({ from, to, value: 1 - value, n, d });
  },
  easeOutBounce,
  easeInOutBounce({ from = 0, to = 1, value, n = 7.5625, d = 2.75 }) {
    return value < 0.5
      ? (1 -
          easeOutBounce({
            from,
            to,
            value: 1 - 2 * value,
            n,
            d,
          })) /
          2
      : (1 +
          easeOutBounce({
            from,
            to,
            value: 2 * value - 1,
            n,
            d,
          })) /
          2;
  },
  linear({ from = 0, to = 1, value }) {
    return map({ from, to, value });
  },
  cos({ from = 0, to = 1, value }) {
    return remap({
      fromIn: -1,
      toIn: 1,
      fromOut: from,
      toOut: to,
      value: Math.cos(value),
    });
  },
} as const satisfies Record<string, TimingFunction>;
