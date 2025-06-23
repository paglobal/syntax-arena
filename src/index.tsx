import { render } from "lit";
import App from "./App";
import "./index.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";

setBasePath("/");

render(<App />, document.body);
