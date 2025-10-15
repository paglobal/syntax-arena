import "./index.css";
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import "@awesome.me/webawesome/dist/styles/themes/awesome.css";
import { setBasePath } from "@awesome.me/webawesome/dist/webawesome.js";
import "./customElements";
import { render } from "lit";
import { App } from "./App";
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
