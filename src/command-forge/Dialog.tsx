import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import WaTextarea from "@awesome.me/webawesome/dist/components/textarea/textarea.js";
import { createRef, ref } from "lit/directives/ref.js";
import { adaptState } from "promethium-js";

export type Action = {
  id: string;
  name: string;
  execute: () => void;
};

type Actions = Action[];

type ClosedDialogState = { type: "closed"; title: "Closed" };

type ActionsDialogState = {
  type: "actions";
  title: "Actions";
  actions: Action[];
};

type OptionsDialogState = {
  type: "options";
  title: string;
  options: { name: string; value: unknown }[];
  onSelect: (value: unknown) => void;
};

type InputDialogStateInitialValue = string | number;

type InputDialogState = {
  type: "input";
  title: string;
  inputType: "text" | "number";
  initialValue: InputDialogStateInitialValue;
  onSubmit: (value: InputDialogStateInitialValue) => void;
};

type DialogState =
  | ClosedDialogState
  | ActionsDialogState
  | OptionsDialogState
  | InputDialogState;

const [dialogState, setDialogState] = adaptState<DialogState>({
  type: "closed",
  title: "Closed",
});

export function openActionsDialog(actions: Actions) {
  setDialogState({ type: "actions", title: "Actions", actions });
}

export function openOptionsDialog(config: Omit<OptionsDialogState, "type">) {
  setDialogState({ type: "options", ...config });
}

export function openInputDialog(config: Omit<InputDialogState, "type">) {
  setDialogState({ type: "input", ...config });
}

export function closeDialog() {
  setDialogState({ type: "closed", title: "Closed" });
}

export function Dialog() {
  return () => {
    const state = dialogState();
    const open = state.type !== "closed";
    const inputRef = createRef<WaInput | WaTextarea>();

    return (
      <wa-dialog
        label={state.title}
        prop:open={open}
        on:wa-hide={closeDialog}
        on:wa-show={() => {
          if (state.type === "input") {
            inputRef.value?.select();
          }
        }}
      >
        {state.type === "actions" && (
          <div>
            {state.actions.map((action) => (
              <wa-button
                appearance="plain"
                on:click={() => {
                  closeDialog();
                  action.execute();
                }}
              >
                {action.name}
              </wa-button>
            ))}
          </div>
        )}
        {state.type === "options" && (
          <div>
            {state.options.map((option) => (
              <wa-button
                appearance="plain"
                on:click={() => {
                  closeDialog();
                  state.onSelect(option.value);
                }}
              >
                {option.name}
              </wa-button>
            ))}
          </div>
        )}
        {state.type === "input" && (
          <div>
            {state.inputType === "number" ? (
              <wa-input
                type={state.inputType}
                autofocus
                use:ref={ref(inputRef)}
                value={String(state.initialValue)}
                prop:required
              />
            ) : (
              <wa-textarea
                autofocus
                use:ref={ref(inputRef)}
                value={String(state.initialValue)}
                prop:required
              ></wa-textarea>
            )}
            <wa-button
              on:click={() => {
                closeDialog();
                const value =
                  state.inputType === "number"
                    ? Number(inputRef.value?.value)
                    : (inputRef.value?.value ?? "");
                state.onSubmit(value);
              }}
            >
              Submit
            </wa-button>
          </div>
        )}
      </wa-dialog>
    );
  };
}
