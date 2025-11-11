import "./index.css";
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import "@awesome.me/webawesome/dist/styles/themes/awesome.css";
import { setBasePath } from "@awesome.me/webawesome/dist/webawesome.js";
import "./customElements";
import { render } from "lit";
import { App } from "./App";
import { assetFolders } from "./constants";
import { initialize } from "@/orchestrator/orchestrator";
import { loadAssetBundle } from "./utils";

setBasePath("/");

(async () => {
  await loadAssetBundle(assetFolders.characters);
  await loadAssetBundle(assetFolders.objects);
  render(<App />, document.body);
  await initialize();
})();
