import { imperativeUpdate, Setter } from "promethium-js";
import { Assets } from "pixi.js";
import { assetAliases, assetFolders } from "./constants";

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

type AssetFolder = (typeof assetFolders)[keyof typeof assetFolders];

function getSVGAssetObject(folder: AssetFolder, alias: string) {
  return { alias, src: `/assets/${folder}/${alias}.svg` };
}

export async function loadAssetBundle(folder: AssetFolder) {
  const assetArray = Object.values(assetAliases[folder]).map((alias) =>
    getSVGAssetObject(folder, alias),
  );
  Assets.addBundle(folder, assetArray);
  await Assets.loadBundle(folder);
}
