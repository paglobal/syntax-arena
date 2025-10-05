import { css, unsafeCSS } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { Display } from "./interpreter";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";

const accentColor = "var(--sl-color-neutral-600)";

const namedContainerStyles = css`
  ${styles.scope} {
    position: relative;
    border: 0.15rem solid ${unsafeCSS(accentColor)};
    border-radius: 0.5rem;
    padding: 0.4rem 0.5rem;
    margin: 0.5rem;
    min-width: max-content;
  }

  ${styles.scope}::before {
    content: var(--container-name);
    position: absolute;
    top: -1.1rem;
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
    box-shadow: 0 0 0 0.25rem var(--sl-input-focus-ring-color);
  }

  ${styles.scope} + .spacer {
    width: 100%;
    height: 0.125rem;
  }
`;

export function NamedContainer(props: {
  display: Display;
  id: string;
  name: string;
  children: PromethiumNode;
  focused?: boolean;
  onClick?: (e: MouseEvent) => void;
}) {
  const onClickListenerObject = {
    handleEvent(e: MouseEvent) {
      e.stopPropagation();
      props.onClick?.(e);
    },
  };

  return () => (
    <>
      <div
        id={props.id}
        tabIndex={0}
        use:style={styles.inject(namedContainerStyles)}
        $attr:style={styleMap({
          display: props.display ?? "inline-block",
          "--container-name": `"${props.name}"`,
        })}
        $attr:class={classMap({ focused: props.focused ?? false })}
        on:click={onClickListenerObject}
      >
        {props.children}
      </div>
      {props.display === "block" ? <div class="spacer"></div> : null}
    </>
  );
}
