import { imperativeUpdate } from "promethium-js";
import {
  AST,
  interpret,
  Scope,
} from "@/strategy-sandbox/command-forge/interpreter";
import {
  focusedShardImmediateChild,
  focusedShardSibling,
  orchestratorState,
  setOrchestratorState,
} from "./orchestrator";
import { forgeInputRef } from "@/strategy-sandbox/command-forge/CommandForge";
import { assertNever, replaceInArray } from "@/utils";
import { programUtils } from "./programUtils";

export const actions = {
  focusNextSiblingShard() {
    const _orchestratorState = orchestratorState();
    setOrchestratorState({
      ..._orchestratorState,
      focusedShard: focusedShardSibling("next"),
    });
    const viewportHeight = window.innerHeight;
    const elem = document.getElementById(orchestratorState().focusedShard.id);
    const elemHeight = elem?.getBoundingClientRect().height;

    const block = elemHeight && elemHeight > viewportHeight ? "end" : "start";

    elem?.scrollIntoView({ block, behavior: "smooth" });
  },
  focusPreviousSiblingShard() {
    const _orchestratorState = orchestratorState();
    setOrchestratorState({
      ..._orchestratorState,
      focusedShard: focusedShardSibling("previous"),
    });
    const viewportHeight = window.innerHeight;
    const elem = document.getElementById(orchestratorState().focusedShard.id);
    const elemHeight = elem?.getBoundingClientRect().height;

    const block = elemHeight && elemHeight > viewportHeight ? "start" : "end";

    elem?.scrollIntoView({ block, behavior: "smooth" });
  },
  enterFocusedShard() {
    const focusedShard = orchestratorState().focusedShard;
    const _focusedShardImmediateChild = focusedShardImmediateChild();

    // check if null for primitive values and check undefined for empty arrays, even though that shouldn't happen
    if (
      _focusedShardImmediateChild !== null &&
      _focusedShardImmediateChild !== undefined
    ) {
      const _orchestratorState = orchestratorState();
      setOrchestratorState({
        ..._orchestratorState,
        focusedShard: _focusedShardImmediateChild,
      });
    } else if (focusedShard.type === "String") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = focusedShard.value;
          forgeInputRef.value.type = "text";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (focusedShard.type === "Identifier") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = focusedShard.name;
          forgeInputRef.value.type = "text";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (focusedShard.type === "Number") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = String(focusedShard.value);
          forgeInputRef.value.type = "number";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (focusedShard.type === "Boolean") {
      focusedShard.value = !focusedShard.value;
      setOrchestratorState(imperativeUpdate);
    }
  },
  exitFocusedShard() {
    const _orchestratorState = orchestratorState();
    // we technically shouldn't be able to exit until the parent is null because we don't allow exiting
    // into the main program anyways
    if (
      _orchestratorState.focusedShard.parent !== null &&
      _orchestratorState.focusedShard.parent.type !== "Program"
    ) {
      setOrchestratorState({
        ..._orchestratorState,
        focusedShard: _orchestratorState.focusedShard.parent,
      });
    }
  },
  addShardInFrontOfFocusedShardAndFocus() {
    const focusedShard = orchestratorState().focusedShard;
    let focusedShardIndex = -1;

    if ((focusedShard.parent as AST.ShardGroup).contents) {
      focusedShardIndex = (
        focusedShard.parent as AST.ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === focusedShard);
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
        return;
      }
    }

    // we shouldn't even reach the point where the focused shard is the program anyways
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }

    switch (focusedShard.parent.type) {
      case "Identifiers":
        const identifier = programUtils.generateIdentifier(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex + 1),
          identifier,
          ...focusedShard.parent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Properties":
        const property = programUtils.generateProperty(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex + 1),
          property,
          ...focusedShard.parent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Values":
        const value = programUtils.generateValue(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex + 1),
          value,
          ...focusedShard.parent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Statements":
        const statement = programUtils.generateStatement(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex + 1),
          statement,
          ...focusedShard.parent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      default:
        return;
    }

    setOrchestratorState(imperativeUpdate);
    actions.focusNextSiblingShard();
  },
  addShardBehindFocusedShardAndFocus() {
    const focusedShard = orchestratorState().focusedShard;
    let focusedShardIndex = -1;

    if ((focusedShard.parent as AST.ShardGroup).contents) {
      focusedShardIndex = (
        focusedShard.parent as AST.ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === focusedShard);
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
      }
    }

    // we shouldn't even reach the point where the focused shard is the program anyways
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }

    switch (focusedShard.parent.type) {
      case "Identifiers":
        const identifier = programUtils.generateIdentifier(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex),
          identifier,
          ...focusedShard.parent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Properties":
        const property = programUtils.generateProperty(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex),
          property,
          ...focusedShard.parent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Values":
        const value = programUtils.generateValue(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex),
          value,
          ...focusedShard.parent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Statements":
        const statement = programUtils.generateStatement(focusedShard.parent);
        focusedShard.parent.contents = [
          ...focusedShard.parent.contents.slice(0, focusedShardIndex),
          statement,
          ...focusedShard.parent.contents.slice(focusedShardIndex),
        ];

        break;
      default:
        return;
    }

    setOrchestratorState(imperativeUpdate);
    actions.focusPreviousSiblingShard();
  },
  deleteFocusedShard() {
    const focusedShard = orchestratorState().focusedShard;
    let focusedShardIndex = -1;

    // we shouldn't even reach the point where the focused shard is the program anyways
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }

    if (
      (focusedShard.parent as AST.ShardGroup).contents &&
      (focusedShard.parent as AST.ShardGroup).contents.length > 1
    ) {
      focusedShardIndex = (
        focusedShard.parent as AST.ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === focusedShard);

      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
        return;
      }

      if (
        focusedShardIndex ===
        (focusedShard.parent as AST.ShardGroup).contents.length - 1
      ) {
        actions.focusPreviousSiblingShard();
      } else {
        actions.focusNextSiblingShard();
      }

      (focusedShard.parent as AST.ShardGroup).contents = (
        focusedShard.parent as AST.ShardGroup
      ).contents.filter(
        (syntaxShard) => syntaxShard !== focusedShard,
      ) as AST.ShardGroup["contents"];
      setOrchestratorState(imperativeUpdate);
    }
  },
  toggleFocusedShardDisplayStyle() {
    const _orchestratorState = orchestratorState();
    if (
      _orchestratorState.focusedShard.parent !== null &&
      _orchestratorState.focusedShard.parent.type !== "Program"
    ) {
      _orchestratorState.focusedShard.display =
        _orchestratorState.focusedShard.display === "block"
          ? "inline-block"
          : "block";
      setOrchestratorState(imperativeUpdate);
    }
  },
  toggleFocusedShardType() {
    const focusedShard = orchestratorState().focusedShard;

    // we shouldn't even technically enter this state
    if (focusedShard.parent === null) {
      return;
    }

    switch (focusedShard.type) {
      case "String": {
        const number = programUtils.generateNumber(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({ ..._orchestratorState, focusedShard: number });
        switch (focusedShard.parent.type) {
          case "Assignment":
          case "Definition":
          case "Property": {
            focusedShard.parent.expression = number;

            break;
          }
          case "Values": {
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: number,
            });

            break;
          }
          case "Function": {
            focusedShard.parent.return = number;

            break;
          }
          default:
            assertNever(focusedShard.parent);
        }

        break;
      }
      case "Number": {
        const boolean = programUtils.generateBoolean(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({ ..._orchestratorState, focusedShard: boolean });
        switch (focusedShard.parent.type) {
          case "Assignment":
          case "Definition":
          case "Property": {
            focusedShard.parent.expression = boolean;

            break;
          }
          case "Values": {
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: boolean,
            });

            break;
          }
          case "Function": {
            focusedShard.parent.return = boolean;

            break;
          }
          default:
            assertNever(focusedShard.parent);
        }

        break;
      }
      case "Boolean": {
        const nullShard = programUtils.generateNull(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({
          ..._orchestratorState,
          focusedShard: nullShard,
        });
        switch (focusedShard.parent.type) {
          case "Assignment":
          case "Definition":
          case "Property": {
            focusedShard.parent.expression = nullShard;

            break;
          }
          case "Values": {
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: nullShard,
            });

            break;
          }
          case "Function": {
            focusedShard.parent.return = nullShard;

            break;
          }
          default:
            assertNever(focusedShard.parent);
        }

        break;
      }
      case "Null": {
        const call = programUtils.generateCall(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({ ..._orchestratorState, focusedShard: call });
        switch (focusedShard.parent.type) {
          case "Assignment":
          case "Definition":
          case "Property": {
            focusedShard.parent.expression = call;

            break;
          }
          case "Values": {
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: call,
            });

            break;
          }
          case "Function": {
            focusedShard.parent.return = call;

            break;
          }
          default:
            assertNever(focusedShard.parent);
        }

        break;
      }
      case "Call": {
        switch (focusedShard.parent.type) {
          case "Statements": {
            const assignment = programUtils.generateAssignment(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: assignment,
            });
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: assignment,
            });

            break;
          }
          case "Assignment":
          case "Definition":
          case "Property": {
            const identifiers = programUtils.generateIdentifiers(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: identifiers,
            });
            focusedShard.parent.expression = identifiers;

            break;
          }
          case "Values": {
            const identifiers = programUtils.generateIdentifiers(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: identifiers,
            });
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: identifiers,
            });

            break;
          }
          case "Function": {
            const identifiers = programUtils.generateIdentifiers(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: identifiers,
            });
            focusedShard.parent.return = identifiers;

            break;
          }
          default: {
            assertNever(focusedShard.parent);
          }
        }

        break;
      }
      case "Assignment": {
        const definition = programUtils.generateDefinition(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({
          ..._orchestratorState,
          focusedShard: definition,
        });
        replaceInArray({
          array: focusedShard.parent.contents,
          oldItem: focusedShard,
          newItem: definition,
        });

        break;
      }
      case "Definition": {
        const call = programUtils.generateCall(focusedShard.parent);
        const _orchestratorState = orchestratorState();
        setOrchestratorState({ ..._orchestratorState, focusedShard: call });
        replaceInArray({
          array: focusedShard.parent.contents,
          oldItem: focusedShard,
          newItem: call,
        });

        break;
      }
      case "Identifiers": {
        switch (focusedShard.parent.type) {
          case "Function": {
            // for function parameters
            if (focusedShard === focusedShard.parent.parameters) {
              break;
              // for function returns
            } else {
              const functionShard = programUtils.generateFunction(
                focusedShard.parent,
              );
              const _orchestratorState = orchestratorState();
              setOrchestratorState({
                ..._orchestratorState,
                focusedShard: functionShard,
              });
              focusedShard.parent.return = functionShard;

              break;
            }
          }
          case "Call": {
            const functionShard = programUtils.generateFunction(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: functionShard,
            });
            focusedShard.parent.callee = functionShard;

            break;
          }
          case "Assignment": {
            if (focusedShard === focusedShard.parent.assignee) {
              break;
            } else {
              const functionShard = programUtils.generateFunction(
                focusedShard.parent,
              );
              const _orchestratorState = orchestratorState();
              setOrchestratorState({
                ..._orchestratorState,
                focusedShard: functionShard,
              });
              focusedShard.parent.expression = functionShard;

              break;
            }
          }
          case "Definition":
          case "Property": {
            const functionShard = programUtils.generateFunction(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: functionShard,
            });
            focusedShard.parent.expression = functionShard;

            break;
          }
          case "Values":
            {
              const functionShard = programUtils.generateFunction(
                focusedShard.parent,
              );
              const _orchestratorState = orchestratorState();
              setOrchestratorState({
                ..._orchestratorState,
                focusedShard: functionShard,
              });
              replaceInArray({
                array: focusedShard.parent.contents,
                oldItem: focusedShard,
                newItem: functionShard,
              });
            }

            break;
          default: {
            assertNever(focusedShard.parent);
          }
        }

        break;
      }
      case "Function": {
        switch (focusedShard.parent.type) {
          case "Call": {
            if (focusedShard === focusedShard.parent.callee) {
              const identifiers = programUtils.generateIdentifiers(
                focusedShard.parent,
              );
              const _orchestratorState = orchestratorState();
              setOrchestratorState({
                ..._orchestratorState,
                focusedShard: identifiers,
              });
              focusedShard.parent.callee = identifiers;
            }

            break;
          }
          case "Assignment":
          case "Definition":
          case "Property": {
            const values = programUtils.generateValues(focusedShard.parent);
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: values,
            });
            focusedShard.parent.expression = values;

            break;
          }
          case "Values": {
            const values = programUtils.generateValues(focusedShard.parent);
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: values,
            });
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: values,
            });

            break;
          }
          case "Function": {
            const values = programUtils.generateValues(focusedShard.parent);
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: values,
            });
            focusedShard.parent.return = values;

            break;
          }
          default: {
            assertNever(focusedShard.parent);
          }
        }

        break;
      }
      case "Values": {
        switch (focusedShard.parent.type) {
          case "Call": {
            break;
          }
          case "Assignment":
          case "Definition":
          case "Property": {
            const properties = programUtils.generateProperties(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: properties,
            });
            focusedShard.parent.expression = properties;

            break;
          }
          case "Values": {
            const properties = programUtils.generateProperties(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: properties,
            });
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: properties,
            });

            break;
          }
          case "Function": {
            const properties = programUtils.generateProperties(
              focusedShard.parent,
            );
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: properties,
            });
            focusedShard.parent.return = properties;

            break;
          }
          default: {
            assertNever(focusedShard.parent);
          }
        }

        break;
      }
      case "Properties": {
        switch (focusedShard.parent.type) {
          case "Assignment":
          case "Definition":
          case "Property": {
            const string = programUtils.generateString(focusedShard.parent);
            focusedShard.parent.expression = string;
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: string,
            });

            break;
          }
          case "Values": {
            const string = programUtils.generateString(focusedShard.parent);
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: string,
            });
            replaceInArray({
              array: focusedShard.parent.contents,
              oldItem: focusedShard,
              newItem: string,
            });

            break;
          }
          case "Function": {
            const string = programUtils.generateString(focusedShard.parent);
            const _orchestratorState = orchestratorState();
            setOrchestratorState({
              ..._orchestratorState,
              focusedShard: string,
            });
            focusedShard.parent.return = string;

            break;
          }
          default: {
            assertNever(focusedShard.parent);
          }
        }

        break;
      }
      case "Identifier":
      case "Property":
      case "Statements":
        break;
      default:
        assertNever(focusedShard);
    }

    setOrchestratorState(imperativeUpdate);
  },
  executeFocusedStatements() {
    const _orchestratorState = orchestratorState();
    const currentStatements =
      _orchestratorState.program.body[
        _orchestratorState.currentStatementsIndex
      ];
    const scope: Scope = new Map();
    scope.set("log", (a: string) => console.log(a));
    scope.set("gt", function* () {
      yield 4;
      yield 6;
      console.log("waddup!");

      return "hey!";
    });
    for (const _ of interpret({
      statements: currentStatements,
      context: { scope },
    })) {
    }
  },
  toggleGameLoopPlayingState() {},
};
