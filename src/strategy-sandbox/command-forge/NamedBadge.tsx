import { css } from "lit";
import { PromethiumNode, styles } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import WaBadge from "@awesome.me/webawesome/dist/components/badge/badge.js";

const namedBadgeStyles = css`
  ${styles.scope} {
    margin-bottom: 0.75rem;
  }

  ${styles.scope}.focused {
    box-shadow: 0 0 0.1rem 0.2rem var(--wa-color-focus);
  }
`;

export function NamedBadge(props: {
  id: string;
  children: PromethiumNode;
  focused?: boolean;
  onClick?: (e: MouseEvent) => void;
  variant: WaBadge["variant"];
}) {
  const onClickListenerObject = {
    handleEvent(e: MouseEvent) {
      e.stopPropagation();
      props.onClick?.(e);
    },
  };

  return () => (
    <>
      <wa-badge
        id={props.id}
        tabIndex={0}
        appearance="outlined"
        variant={props.variant}
        use:style={styles.inject(namedBadgeStyles)}
        $attr:style={styleMap({
          display: "block",
        })}
        $attr:class={classMap({ focused: props.focused ?? false })}
        on:click={onClickListenerObject}
      >
        {props.children}
      </wa-badge>
    </>
  );
}
