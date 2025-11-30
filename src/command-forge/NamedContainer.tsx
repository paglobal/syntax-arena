import { css } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { classMap } from "lit/directives/class-map.js";

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

  ${sharedShardChildStyles}
`;

export function NamedContainer(props: {
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
      <wa-card
        id={props.id}
        tabIndex={0}
        $attr:class={classMap({ focused: props.focused ?? false })}
        use:style={styles.inject(namedContainerStyles)}
        on:click={onClickListenerObject}
      >
        <span slot="header">{props.name}</span>
        {props.children}
      </wa-card>
    </>
  );
}
