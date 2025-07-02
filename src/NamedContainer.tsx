import { css, unsafeCSS } from "lit";
import { PromethiumNode, styles } from "promethium-js";

export function NamedContainer(props: {
  display?: "inline-block" | "block";
  id: string;
  name: string;
  nameMutable?: boolean;
  minimalPadding?: boolean;
  children: PromethiumNode;
  minWidth?: string;
}) {
  const accentColor = props.nameMutable
    ? "var(--sl-color-neutral-1000)"
    : "var(--sl-color-neutral-700)";

  const namedContainerStyles = css`
    ${styles.scope} {
      display: ${unsafeCSS(props.display ?? "inline-block")};
      position: relative;
      border: 0.15rem solid ${unsafeCSS(accentColor)};
      border-radius: 0.5rem;
      padding: ${unsafeCSS(props.minimalPadding ? "0.25rem 0.5rem" : "0.5rem")};
      margin: 0.5rem;
      min-width: ${unsafeCSS(props.minWidth ?? "5rem")};
    }

    ${styles.scope}::before {
      content: "${unsafeCSS(props.name)}";
      position: absolute;
      top: -1.05rem;
      white-space: nowrap;
      left: 0;
      font-size: var(--sl-font-size-x-small);
      color: ${unsafeCSS(accentColor)};
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ${styles.scope}:focus {
      outline: 0.15rem solid var(--sl-color-primary-800);
    }

    ${styles.scope} + .spacer {
      width: 100%;
      height: 0.125rem;
    }
  `;

  return () => (
    <>
      <div
        id={props.id}
        tabIndex={-1}
        use:style={styles.inject(namedContainerStyles)}
      >
        {props.children}
      </div>
      {props.display === "block" ? <div class="spacer"></div> : null}
    </>
  );
}
