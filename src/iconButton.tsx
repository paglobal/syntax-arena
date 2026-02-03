import WaButton from "@awesome.me/webawesome/dist/components/button/button.js";
import { css } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { styles } from "promethium-js";

const iconButtonStyles = css`
  wa-button${styles.scope}::part(base) {
    background: var(--wa-color-neutral-05);
  }
`;

export function iconButton(props: {
  iconName: string;
  iconLabel: string;
  onClick: (e: MouseEvent) => void;
  id?: string;
  buttonStyles?: Record<string, string | number>;
  iconStyles?: Record<string, string | number>;
  appearance?: WaButton["appearance"];
  variant?: WaButton["variant"];
}) {
  const appearance = props.appearance ?? "outlined";
  const variant = props.variant ?? "neutral";
  const buttonStyles = props.buttonStyles ?? {};
  const iconStyles = props.iconStyles ?? {};

  return (
    <>
      <wa-button
        size="small"
        use:styles={
          appearance === "outlined" ? styles.inject(iconButtonStyles) : null
        }
        appearance={appearance}
        variant={variant}
        pill
        id={props.id}
        $attr:style={styleMap(buttonStyles)}
        on:click={props.onClick}
      >
        <wa-icon
          name={props.iconName}
          label={props.iconLabel}
          $attr:style={styleMap(iconStyles)}
        ></wa-icon>
      </wa-button>
    </>
  );
}
