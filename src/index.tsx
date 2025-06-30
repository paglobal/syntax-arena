import { render } from "lit";
import { App } from "./App";
import "./index.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import "./customElements";
import { Assets } from "pixi.js";
import { assetAliases, assetFolders } from "./constants";

setBasePath("/");

type AssetFolder = (typeof assetFolders)[keyof typeof assetFolders];

function getSVGAssetObject(folder: AssetFolder, alias: string) {
  return { alias, src: `/assets/${folder}/${alias}.svg` };
}

async function loadAssetBundle(folder: AssetFolder) {
  const assetArray = Object.values(assetAliases[folder]).map((alias) =>
    getSVGAssetObject(folder, alias),
  );
  Assets.addBundle(folder, assetArray);
  await Assets.loadBundle(folder);
}

(async () => {
  await loadAssetBundle(assetFolders.characters);
  await loadAssetBundle(assetFolders.objects);

  render(<App />, document.body);
})();