import { css } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

export const sharedShardChildStyles = css`
  ${styles.scope} {
    margin: 0.75rem 0;
    font-size: 1rem;
    text-transform: none;
  }
`;

const namedContainerStyles = css`
  ${styles.scope}::part(header), ${styles.scope}::part(body) {
    padding: 0.25rem 1rem;
  }

  ${styles.scope} {
    border-radius: var(--wa-border-radius-m);
    border-width: var(--wa-border-width-m);
    background-color: var(--wa-color-surface-default);
  }

  ${styles.scope}.focused {
    box-shadow: 0 0 0.4rem 0.2rem var(--wa-color-focus);
  }

  ${styles.scope} wa-button::part(base) {
    padding: 1rem;
    height: 1rem;
    width: 1rem;
  }

  ${sharedShardChildStyles}
`;

export function NamedContainer(props: {
  id: string;
  name: string;
  children: PromethiumNode;
  showActions: () => void;
  focused?: boolean;
  onClick?: (e: MouseEvent) => void;
}) {
  const onClickListenerObject = {
    handleEvent(e: MouseEvent) {
      e.stopPropagation();
      props.onClick?.(e);
    },
  };

  const showActionsListenerObject = {
    handleEvent(e: MouseEvent) {
      e.stopPropagation();
      props.showActions();
    },
  };

  return () => (
    <>
      <wa-card
        id={props.id}
        $attr:class={classMap({ focused: props.focused ?? false })}
        use:style={styles.inject(namedContainerStyles)}
        on:click={onClickListenerObject}
      >
        <span slot="header">{props.name}</span>
        <div
          $attr:style={styleMap({
            display: "flex",
          })}
          slot="header-actions"
        >
          <wa-button appearance="plain">
            <wa-icon name="repeat" variant="solid" label="Repeat"></wa-icon>
          </wa-button>
          <wa-button
            size="small"
            appearance="plain"
            on:click={showActionsListenerObject}
          >
            <wa-icon name="ellipsis" variant="solid" label="Options"></wa-icon>
          </wa-button>
        </div>
        {props.children}
      </wa-card>
    </>
  );
}
