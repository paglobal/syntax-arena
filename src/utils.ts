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
