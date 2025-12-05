import { createRef, ref } from "lit/directives/ref.js";
import { adaptEffect, adaptState, styles } from "promethium-js";
import { Interactions } from "./forgeController";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import WaTextarea from "@awesome.me/webawesome/dist/components/textarea/textarea.js";
import { css } from "lit";

type ActionsState = {
  type: "actions";
  actions: Interactions.Action[];
};

type OptionsState = Interactions.Options;

type InputState = Interactions.Input;

type ClosedState = { type: "closed" };

type DialogState = ActionsState | OptionsState | InputState | ClosedState;

export type DialogController = ReturnType<typeof createDialogController>;

export function createDialogController() {
  const [dialogState, setDialogState] = adaptState<DialogState>({
    type: "closed",
  });
  const dialogRef = createRef<WaDialog>();

  function openActionsDialog(actions: Interactions.Action[]) {
    setDialogState({ type: "actions", actions });
  }

  function openOptionsDialog(options: Interactions.Options) {
    setDialogState(options);
  }

  function openInputDialog(input: Interactions.Input) {
    setDialogState(input);
  }

  function closeDialog() {
    setDialogState({ type: "closed" });
  }

  return {
    dialogState,
    dialogRef,
    openActionsDialog,
    openOptionsDialog,
    openInputDialog,
    closeDialog,
  };
}

const dialogStyles = css`
  ${styles.scope}::part(body) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export function Dialog(props: { dialogController: DialogController }) {
  const inputRef = createRef<WaInput | WaTextarea>();

  function handleResult(result: Interactions.Result) {
    if (!result) {
      return;
    }
    if (result.type === "options") {
      props.dialogController.openOptionsDialog(result);
    } else if (result.type === "input") {
      props.dialogController.openInputDialog(result);
    }
  }

  adaptEffect(() => {
    const state = props.dialogController.dialogState();
    const open = state.type !== "closed";
    if (props.dialogController.dialogRef.value) {
      if (open) {
        props.dialogController.dialogRef.value.open = true;
        if (state.type === "input") {
          inputRef.value?.focus();
          inputRef.value?.select();
        }
      } else {
        props.dialogController.dialogRef.value.open = false;
      }
    }
  });

  return () => {
    const state = props.dialogController.dialogState();

    return (
      <wa-dialog
        label={
          state.type === "actions"
            ? "Actions"
            : state.type === "options"
              ? "Options"
              : state.type === "input"
                ? "Input"
                : ""
        }
        use:styles={styles.inject(dialogStyles)}
        on:wa-hide={props.dialogController.closeDialog}
        use:ref={ref(props.dialogController.dialogRef)}
      >
        {state.type === "actions" ? (
          <>
            {state.actions.map((action) => (
              <wa-button
                on:click={() => {
                  props.dialogController.closeDialog();
                  handleResult(action.execute());
                }}
              >
                {action.id}
              </wa-button>
            ))}
          </>
        ) : null}
        {state.type === "options" ? (
          <>
            {state.elements.map((element) => (
              <wa-button
                on:click={() => {
                  props.dialogController.closeDialog();
                  handleResult(state.select(element));
                }}
              >
                {element}
              </wa-button>
            ))}
          </>
        ) : null}
        {state.type === "input" ? (
          <>
            <wa-input
              type={typeof state.currentValue === "number" ? "number" : "text"}
              use:ref={ref(inputRef)}
              value={String(state.currentValue)}
              prop:required
            />
            <wa-button
              on:click={() => {
                const value =
                  typeof state.currentValue === "number"
                    ? Number(inputRef.value?.value)
                    : (inputRef.value?.value ?? "");
                props.dialogController.closeDialog();
                handleResult(state.change(value));
              }}
            >
              Submit
            </wa-button>
          </>
        ) : null}
      </wa-dialog>
    );
  };
}
