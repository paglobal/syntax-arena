import { adaptEffect, imperativeUpdate } from "promethium-js";
import {
  Assignment,
  Bool,
  Call,
  Definition,
  Fn,
  Identifier,
  Identifiers,
  Null,
  Num,
  Properties,
  Property,
  ShardGroup,
  Statement,
  Statements,
  Str,
  Value,
  Values,
} from "./interpreter";
import {
  focusedShard,
  focusedShardImmediateChild,
  focusedShardParent,
  focusedShardPath,
  focusedShardSibling,
  setFocusedShardPath,
  setProgram,
} from "./orchestrator";
import { forgeInputRef } from "./CommandForge";

export const programUtils = {
  generateString(value: string = ""): Str {
    return { id: crypto.randomUUID(), type: "String", value };
  },
  generateNumber(value: number = 0): Num {
    return { id: crypto.randomUUID(), type: "Number", value };
  },
  generateBoolean(value: boolean = false): Bool {
    return { id: crypto.randomUUID(), type: "Boolean", value };
  },
  generateNull(): Null {
    return { id: crypto.randomUUID(), type: "Null", value: null };
  },
  generateIdentifier(name: string = "x"): Identifier {
    return { id: crypto.randomUUID(), type: "Identifier", name };
  },
  generateIdentifiers(): Identifiers {
    return {
      id: crypto.randomUUID(),
      type: "Identifiers",
      contents: [programUtils.generateIdentifier()],
    };
  },
  generateProperty(): Property {
    return {
      id: crypto.randomUUID(),
      type: "Property",
      key: programUtils.generateIdentifier(),
      expression: programUtils.generateValue(),
    };
  },
  generateProperties(): Properties {
    return {
      id: crypto.randomUUID(),
      type: "Properties",
      contents: [programUtils.generateProperty()],
    };
  },
  generateValue(): Value {
    return programUtils.generateNumber();
  },
  generateValues(): Values {
    return {
      id: crypto.randomUUID(),
      type: "Values",
      contents: [programUtils.generateValue()],
    };
  },
  generateFunction(): Fn {
    return {
      id: crypto.randomUUID(),
      type: "Function",
      parameters: programUtils.generateIdentifiers(),
      body: programUtils.generateStatements(),
      return: programUtils.generateValue(),
    };
  },
  generateCall(): Call {
    return {
      id: crypto.randomUUID(),
      type: "Call",
      callee: programUtils.generateIdentifiers(),
      arguments: programUtils.generateValues(),
    };
  },
  generateAssignment(): Assignment {
    return {
      id: crypto.randomUUID(),
      type: "Assignment",
      assignee: programUtils.generateIdentifiers(),
      expression: programUtils.generateValue(),
    };
  },
  generateDefinition(): Definition {
    return {
      id: crypto.randomUUID(),
      type: "Definition",
      assignee: programUtils.generateIdentifier(),
      expression: programUtils.generateValue(),
    };
  },
  generateStatement(): Statement {
    return programUtils.generateCall();
  },
  generateStatements(): Statements {
    return {
      id: crypto.randomUUID(),
      type: "Statements",
      contents: [
        programUtils.generateStatement(),
        programUtils.generateAssignment(),
      ],
    };
  },
};

export const keybindingUtils = {
  focusNextSiblingShard() {
    setFocusedShardPath([
      ...focusedShardPath().slice(0, -1),
      focusedShardSibling("next"),
    ]);
  },
  focusPreviousSiblingShard() {
    setFocusedShardPath([
      ...focusedShardPath().slice(0, -1),
      focusedShardSibling("previous"),
    ]);
  },
  enterFocusedShard() {
    const _focusedShard = focusedShard();
    const _focusedShardImmediateChild = focusedShardImmediateChild();

    if (
      _focusedShardImmediateChild !== null &&
      _focusedShardImmediateChild !== undefined
    ) {
      setFocusedShardPath([
        ...focusedShardPath().slice(),
        _focusedShardImmediateChild,
      ]);
    } else if (_focusedShard.type === "String") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = _focusedShard.value;
          forgeInputRef.value.type = "text";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (_focusedShard.type === "Identifier") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = _focusedShard.name;
          forgeInputRef.value.type = "text";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (_focusedShard.type === "Number") {
      forgeInputRef.value?.scrollIntoView();
      forgeInputRef.value?.focus();
      setTimeout(() => {
        if (forgeInputRef.value) {
          forgeInputRef.value.value = String(_focusedShard.value);
          forgeInputRef.value.type = "number";
          forgeInputRef.value.updateComplete.then(() => {
            forgeInputRef.value?.select();
          });
        }
      });
    } else if (_focusedShard.type === "Boolean") {
      _focusedShard.value = !_focusedShard.value;
      setProgram(imperativeUpdate);
    }
  },
  exitFocusedShard() {
    const newFocusedShardPath = focusedShardPath().slice(0, -1);

    if (newFocusedShardPath.length !== 0) {
      setFocusedShardPath([...newFocusedShardPath]);
    }
  },
  addShardInFrontOfFocusedShardAndFocus() {
    const _focusedShard = focusedShard();
    const _focusedShardParent = focusedShardParent();
    let focusedShardIndex = -1;

    if (_focusedShard === _focusedShardParent) {
      return;
    }

    if ((_focusedShardParent as ShardGroup).contents) {
      focusedShardIndex = (
        _focusedShardParent as ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === _focusedShard);
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
      }
    }

    switch (_focusedShardParent.type) {
      case "Identifiers":
        const identifier = programUtils.generateIdentifier();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex + 1),
          identifier,
          ..._focusedShardParent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Properties":
        const property = programUtils.generateProperty();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex + 1),
          property,
          ..._focusedShardParent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Values":
        const value = programUtils.generateValue();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex + 1),
          value,
          ..._focusedShardParent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      case "Statements":
        const statement = programUtils.generateStatement();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex + 1),
          statement,
          ..._focusedShardParent.contents.slice(focusedShardIndex + 1),
        ];

        break;
      default:
        return;
    }

    setProgram(imperativeUpdate);
    keybindingUtils.focusNextSiblingShard();
  },
  addShardBehindFocusedShardAndFocus() {
    // TODO: replace slice and splice with just slice and spread
    const _focusedShard = focusedShard();
    const _focusedShardParent = focusedShardParent();
    let focusedShardIndex = -1;

    if (_focusedShard === _focusedShardParent) {
      return;
    }

    if ((_focusedShardParent as ShardGroup).contents) {
      focusedShardIndex = (
        _focusedShardParent as ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === _focusedShard);
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
      }
    }

    switch (_focusedShardParent.type) {
      case "Identifiers":
        const identifier = programUtils.generateIdentifier();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex),
          identifier,
          ..._focusedShardParent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Properties":
        const property = programUtils.generateProperty();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex),
          property,
          ..._focusedShardParent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Values":
        const value = programUtils.generateValue();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex),
          value,
          ..._focusedShardParent.contents.slice(focusedShardIndex),
        ];

        break;
      case "Statements":
        const statement = programUtils.generateStatement();
        _focusedShardParent.contents = [
          ..._focusedShardParent.contents.slice(0, focusedShardIndex),
          statement,
          ..._focusedShardParent.contents.slice(focusedShardIndex),
        ];

        break;
      default:
        return;
    }

    setProgram(imperativeUpdate);
    keybindingUtils.focusPreviousSiblingShard();
  },
  deleteFocusedShard() {
    const _focusedShard = focusedShard();
    const _focusedShardParent = focusedShardParent();
    let focusedShardIndex = -1;

    if (_focusedShard === _focusedShardParent) {
      return;
    }

    if (
      (_focusedShardParent as ShardGroup).contents &&
      (_focusedShardParent as ShardGroup).contents.length > 1
    ) {
      focusedShardIndex = (
        _focusedShardParent as ShardGroup
      ).contents.findIndex((syntaxShard) => syntaxShard === _focusedShard);

      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
      }

      if (
        focusedShardIndex ===
        (_focusedShardParent as ShardGroup).contents.length - 1
      ) {
        keybindingUtils.focusPreviousSiblingShard();
      } else {
        keybindingUtils.focusNextSiblingShard();
      }

      (_focusedShardParent as ShardGroup).contents = (
        _focusedShardParent as ShardGroup
      ).contents.filter(
        (syntaxShard) => syntaxShard !== _focusedShard,
      ) as ShardGroup["contents"];

      setProgram(imperativeUpdate);
    }
  },
  toggleFocusedShardDisplayStyle() {
    // const focusedShardId = focusedShard().id;
    // const focusedShardHTMLElement = document.getElementById(focusedShardId);
    // if (focusedShardHTMLElement) {
    //   const currentDisplayStyle = focusedShardHTMLElement?.style.display;
    //   focusedShardHTMLElement.style.display =
    //     currentDisplayStyle === "block" ? "inline-block" : "block";
    // }
  },
  toggleFocusedShardType() {
    const _focusedShard = focusedShard();

    // TODO: do some extra check with regards to the parent, just to be safe

    switch (_focusedShard.type) {
      case "String":
        const number = programUtils.generateNumber();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(number).forEach(
          (key) => ((_focusedShard as any)[key] = (number as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Number":
        const boolean = programUtils.generateBoolean();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(boolean).forEach(
          (key) => ((_focusedShard as any)[key] = (boolean as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Boolean":
        const nullShard = programUtils.generateNull();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(nullShard).forEach(
          (key) => ((_focusedShard as any)[key] = (nullShard as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Null":
        const call = programUtils.generateCall();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(call).forEach(
          (key) => ((_focusedShard as any)[key] = (call as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Call":
        const identifiers = programUtils.generateIdentifiers();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(identifiers).forEach(
          (key) => ((_focusedShard as any)[key] = (identifiers as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Identifiers":
        const functionShard = programUtils.generateFunction();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(functionShard).forEach(
          (key) => ((_focusedShard as any)[key] = (functionShard as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Function":
        const values = programUtils.generateValues();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(values).forEach(
          (key) => ((_focusedShard as any)[key] = (values as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Values":
        const properties = programUtils.generateProperties();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(properties).forEach(
          (key) => ((_focusedShard as any)[key] = (properties as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
      case "Properties":
        const string = programUtils.generateString();
        Object.keys(_focusedShard).forEach(
          (key) => delete (_focusedShard as any)[key],
        );
        Object.keys(string).forEach(
          (key) => ((_focusedShard as any)[key] = (string as any)[key]),
        );
        setProgram(imperativeUpdate);
        break;
    }
  },
  executeFocusedStatements() {},
  toggleGameLoopPlayingState() {},
};

adaptEffect(() => {
  document.getElementById(focusedShard().id)?.focus();
});
