import { css, unsafeCSS } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { Display } from "./interpreter";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import { SlBadge } from "@shoelace-style/shoelace";

const accentColor = "var(--sl-color-neutral-600)";

const namedBadgeStyles = css`
  ${styles.scope} {
    position: relative;
    margin: 0.5rem;
    min-width: max-content;
  }

  ${styles.scope}::before {
    content: var(--container-name);
    position: absolute;
    top: -0.9rem;
    white-space: nowrap;
    left: 0;
    font-size: 0.8rem;
    color: ${unsafeCSS(accentColor)};
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${styles.scope}.focused {
    outline: 0.15rem solid var(--sl-input-border-color-focus);
    border-radius: 0.75rem;
    box-shadow: 0 0 0 0.25rem var(--sl-input-focus-ring-color);
  }

  ${styles.scope} + .spacer {
    width: 100%;
    height: 0.125rem;
  }
`;

export function NamedBadge(props: {
  display: Display;
  id: string;
  name: string;
  children: PromethiumNode;
  focused?: boolean;
  onClick?: (e: MouseEvent) => void;
  variant: SlBadge["variant"];
}) {
  const onClickListenerObject = {
    handleEvent(e: MouseEvent) {
      e.stopPropagation();
      props.onClick?.(e);
    },
  };

  return () => (
    <>
      <sl-badge
        id={props.id}
        tabIndex={0}
        variant={props.variant}
        pill
        pulse
        use:style={styles.inject(namedBadgeStyles)}
        $attr:style={styleMap({
          display: props.display ?? "inline-block",
          "--container-name": `"${props.name}"`,
        })}
        $attr:class={classMap({ focused: props.focused ?? false })}
        on:click={onClickListenerObject}
      >
        {props.children}
      </sl-badge>
      {props.display === "block" ? <div class="spacer"></div> : null}
    </>
  );
}
