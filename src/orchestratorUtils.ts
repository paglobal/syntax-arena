import {
  Assignment,
  Bool,
  Call,
  Definition,
  Fn,
  Identifier,
  Identifiers,
  Num,
  Properties,
  Property,
  Statements,
  Str,
  Values,
} from "./interpreter";

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
      expression: programUtils.generateString(),
    };
  },
  generateProperties(): Properties {
    return {
      id: crypto.randomUUID(),
      type: "Properties",
      contents: [programUtils.generateProperty()],
    };
  },
  generateValues(): Values {
    return {
      id: crypto.randomUUID(),
      type: "Values",
      contents: [programUtils.generateString()],
    };
  },
  generateFunction(): Fn {
    return {
      id: crypto.randomUUID(),
      type: "Function",
      parameters: programUtils.generateIdentifiers(),
      body: programUtils.generateStatements(),
      return: programUtils.generateString(),
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
      expression: programUtils.generateString(),
    };
  },
  generateDefinition(): Definition {
    return {
      id: crypto.randomUUID(),
      type: "Definition",
      assignee: programUtils.generateIdentifier(),
      expression: programUtils.generateString(),
    };
  },
  generateStatements(): Statements {
    return {
      id: crypto.randomUUID(),
      type: "Statements",
      contents: [programUtils.generateCall()],
    };
  },
};

export const keybindingUtils = {
  focusNextSiblingShard() {},
  focusPreviousSiblingShard() {},
  enterCurrentShard() {},
  exitCurrentShard() {},
  addShardInFrontOfCurrentShardAndFocus() {},
  addShardBehindCurrentShardAndFocus() {},
  deleteCurrentShard() {},
  toggleCurrentShardDisplayState() {},
  toggleCurrentShardType() {},
  executeCurrentStatements() {},
  toggleGameLoopPlayingState() {},
};
