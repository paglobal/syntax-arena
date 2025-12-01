import { css, unsafeCSS } from "lit";
import { Arena } from "./arena/Arena";
import { styles } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { initializeArena } from "./arena";
import { CommandForge } from "./command-forge/CommandForge";
import { createForgeController } from "./command-forge";

const dimensions = {
  tabFontSize: "1.25rem",
  tabVerticalPadding: "1.25rem",
};

const tabGroupStyles = css`
  ${styles.scope}::part(tabs) {
    display: flex;
    justify-content: space-around;
  }

  ${styles.scope} wa-tab {
    font-size: ${unsafeCSS(dimensions.tabFontSize)};
  }

  ${styles.scope} wa-tab::part(base) {
    padding: ${unsafeCSS(dimensions.tabVerticalPadding)} 0;
  }

  ${styles.scope} wa-tab-panel::part(base) {
    padding: 0;
  }
`;

const tabPanelContentContainer = (
  content: any,
  styles?: Record<string, unknown>,
) => (
  <div
    $attr:style={styleMap({
      position: "relative",
      width: "100vw",
      height: `calc(100dvh - ${dimensions.tabFontSize} - 2 * ${dimensions.tabVerticalPadding})`,
      border: 0,
      padding: 0,
      ...styles,
    })}
  >
    {content}
  </div>
);

export function App() {
  const tabIds = {
    arena: "arena",
    commandforge: "command-forge",
    combatArchive: "combat-archive",
    tacticalTelemetry: "tactical-telemetry",
    controlSchema: "control-schema",
  };

  let initializedArena = false;

  const forgeController = createForgeController();

  return () => (
    <>
      <wa-tab-group
        on:wa-tab-show={(e) => {
          if (e.detail.name === tabIds.arena && !initializedArena) {
            initializeArena();
            initializedArena = true;
          }
        }}
        placement="bottom"
        use:styles={styles.inject(tabGroupStyles)}
      >
        <wa-tab panel={tabIds.controlSchema}>
          <wa-icon name="file-code" label="Control Schema"></wa-icon>
        </wa-tab>
        <wa-tab panel={tabIds.arena}>
          <wa-icon name="gamepad" label="Arena"></wa-icon>
        </wa-tab>
        <wa-tab panel={tabIds.commandforge}>
          <wa-icon name="code" label="Command Forge"></wa-icon>
        </wa-tab>
        <wa-tab panel={tabIds.tacticalTelemetry}>
          <wa-icon name="terminal" label="Tactical Telemetry"></wa-icon>
        </wa-tab>
        <wa-tab panel={tabIds.combatArchive}>
          <wa-icon name="window-maximize" label="Combat Archive"></wa-icon>
        </wa-tab>
        <wa-tab-panel name={tabIds.controlSchema}>
          {tabPanelContentContainer("This is the custom tab panel.")}
        </wa-tab-panel>
        <wa-tab-panel name={tabIds.arena}>
          {tabPanelContentContainer(<Arena />, {
            overflow: "hidden",
          })}
        </wa-tab-panel>
        <wa-tab-panel name={tabIds.commandforge}>
          {tabPanelContentContainer(
            <CommandForge commandForgeController={forgeController} />,
          )}
        </wa-tab-panel>
        <wa-tab-panel name={tabIds.tacticalTelemetry}>
          {tabPanelContentContainer("This is the custom tab panel.")}
        </wa-tab-panel>
        <wa-tab-panel name={tabIds.combatArchive}>
          {tabPanelContentContainer("This is the custom tab panel.")}
        </wa-tab-panel>
      </wa-tab-group>
    </>
  );
}
