import { imperativeUpdate, Setter } from "promethium-js";

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
