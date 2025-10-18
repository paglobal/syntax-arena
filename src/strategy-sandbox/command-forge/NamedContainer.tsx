import { css } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { classMap } from "lit/directives/class-map.js";

const namedContainerStyles = css`
  ${styles.scope} {
    margin: 0.75rem 0;
  }

  ${styles.scope}.focused {
    box-shadow: 0 0 0.1rem 0.2rem var(--wa-color-focus);
  }
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
