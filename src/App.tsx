import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

function App() {
  return () => (
    <sl-alert bool:open>
      <sl-icon slot="icon" name="info-circle"></sl-icon>
      This is a standard alert. You can customize its content and even the icon.
    </sl-alert>
  );
}

export default App;