import { AST, interpret, Scope } from "./interpreter";
import { forgeInputRef } from "./CommandForge";
import { assertNever } from "@/utils";
import { adaptState, imperativeUpdate } from "promethium-js";

export function generateString(
  parent: AST.StringParent,
  value: string = "",
): AST.String {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "String",
    value,
  };
}

export function generateNumber(
  parent: AST.NumberParent,
  value: number = 0,
): AST.Number {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Number",
    value,
  };
}

export function generateBoolean(
  parent: AST.BooleanParent,
  value: boolean = false,
): AST.Boolean {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Boolean",
    value,
  };
}

export function generateNull(parent: AST.NullParent): AST.Null {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Null",
    value: null,
  };
}

export function generateIdentifier(
  parent: AST.IdentifierParent,
  value: string = "x",
): AST.Identifier {
  return generateString(parent, value);
}

export function generateIdentifiers(
  parent: AST.IdentifiersParent,
): AST.Identifiers {
  const identifiers: AST.Identifiers = {
    id: crypto.randomUUID(),
    parent,
    type: "Identifiers",
    contents: [],
  };
  identifiers.contents.push(generateIdentifier(identifiers));

  return identifiers;
}
export function generateProperty(parent: AST.PropertyParent): AST.Property {
  const propertyBase: Omit<AST.Property, "key" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Property",
    parent,
  };
  const property = propertyBase as AST.Property;
  property.key = generateIdentifier(property);
  property.expression = generateValue(property);

  return property;
}

export function generateProperties(
  parent: AST.PropertiesParent,
): AST.Properties {
  const properties: AST.Properties = {
    id: crypto.randomUUID(),
    parent,
    type: "Properties",
    contents: [],
  };
  properties.contents.push(generateProperty(properties));

  return properties;
}

export function generateValue(parent: AST.BaseValueParent): AST.Value {
  return generateNumber(parent);
}

export function generateValues(parent: AST.ValuesParent): AST.Values {
  const values: AST.Values = {
    id: crypto.randomUUID(),
    parent,
    type: "Values",
    contents: [],
  };
  values.contents.push(generateValue(values));

  return values;
}

export function generateFunction(parent: AST.FunctionParent): AST.Function {
  const baseFn: Omit<AST.Function, "parameters" | "body" | "return"> = {
    id: crypto.randomUUID(),
    parent,
    type: "Function",
  };
  const fn = baseFn as AST.Function;
  fn.parameters = generateIdentifiers(fn);
  fn.body = generateStatements(fn);

  return fn;
}

export function generateCall(parent: AST.CallParent): AST.Call {
  const baseCall: Omit<AST.Call, "callee" | "arguments"> = {
    id: crypto.randomUUID(),
    type: "Call",
    parent,
  };
  const call = baseCall as AST.Call;
  call.callee = generateIdentifiers(call);
  call.arguments = generateValues(call);

  return call;
}

export function generateAssignment(
  parent: AST.AssignmentParent,
): AST.Assignment {
  const baseAssignment: Omit<AST.Assignment, "assignee" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Assignment",
    parent,
  };
  const assignment = baseAssignment as AST.Assignment;
  assignment.assignee = generateIdentifiers(assignment);
  assignment.expression = generateValue(assignment);

  return assignment;
}

export function generateDefinition(
  parent: AST.DefinitionParent,
): AST.Definition {
  const baseDefinition: Omit<AST.Definition, "assignee" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Definition",
    parent,
  };
  const definition = baseDefinition as AST.Definition;
  definition.assignee = generateIdentifier(definition);
  definition.expression = generateValue(definition);

  return definition;
}
export function generateStatement(
  parent: AST.BaseStatementParent,
): AST.Statement {
  return generateCall(parent);
}

export function generateStatements(
  parent: AST.StatementsParent,
): AST.Statements {
  const statements: AST.Statements = {
    id: crypto.randomUUID(),
    parent,
    type: "Statements",
    contents: [],
  };
  statements.contents.push(generateStatement(statements));

  return statements;
}

export function generateProgram(): AST.Program {
  const program: AST.Program = {
    id: crypto.randomUUID(),
    type: "Program",
    parent: null,
    contents: [],
  };
  program.contents.push(generateStatements(program));

  return program;
}

export function executeFocusedStatements(
  commandForgeController: CommandForgeController,
) {
  const _orchestratorState = commandForgeController.commandForgeState();
  const currentStatements =
    _orchestratorState.program.contents[
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
}

export type CommandForgeController = ReturnType<
  typeof createCommandForgeController
>;

export function createCommandForgeController(initialProgram?: AST.Program) {
  initialProgram = initialProgram ?? generateProgram();

  const [commandForgeState, setCommandForgeState] = adaptState<{
    currentStatementsIndex: number;
    program: AST.Program;
    focusedShard: AST.SyntaxShard;
  }>({
    currentStatementsIndex: 0,
    program: initialProgram,
    focusedShard: initialProgram.contents[0],
  });

  const focusedShardSibling = (nextOrPrevious: "next" | "previous") => {
    const focusedShard = commandForgeState().focusedShard;
    if (focusedShard.parent === null) {
      return focusedShard;
    }
    switch (focusedShard.parent.type) {
      case "Function": {
        if (nextOrPrevious === "next") {
          return focusedShard.parent.body;
        } else {
          return focusedShard.parent.parameters;
        }
      }
      case "Property": {
        if (nextOrPrevious === "next") {
          return focusedShard.parent.expression;
        } else {
          return focusedShard.parent.key;
        }
      }
      case "Identifiers":
      case "Properties":
      case "Values":
      case "Statements":
      case "Program": {
        const focusedShardIndex = focusedShard.parent.contents.findIndex(
          (syntaxShard) => syntaxShard === focusedShard,
        );
        if (focusedShardIndex === -1) {
          // @error
          // This case shouldn't happen!
          return focusedShard;
        }
        if (nextOrPrevious === "next") {
          return focusedShard.parent.contents[
            Math.min(
              focusedShardIndex + 1,
              focusedShard.parent.contents.length - 1,
            )
          ];
        } else {
          return focusedShard.parent.contents[
            Math.max(focusedShardIndex - 1, 0)
          ];
        }
      }
      case "Call": {
        if (nextOrPrevious === "next") {
          return focusedShard.parent.arguments;
        } else {
          return focusedShard.parent.callee;
        }
      }
      case "Assignment":
      case "Definition": {
        if (nextOrPrevious === "next") {
          return focusedShard.parent.expression;
        } else {
          return focusedShard.parent.assignee;
        }
      }
      default: {
        assertNever(focusedShard.parent);
      }
    }
  };

  const focusedShardImmediateChild = () => {
    const focusedShard = commandForgeState().focusedShard;
    switch (focusedShard.type) {
      case "String":
      case "Number":
      case "Boolean":
      case "Null": {
        return null;
      }
      case "Function": {
        return focusedShard.parameters;
      }
      case "Property": {
        return focusedShard.key;
      }
      case "Identifiers":
      case "Properties":
      case "Values":
      case "Statements":
      case "Program": {
        return focusedShard.contents[0];
      }
      case "Call": {
        return focusedShard.callee;
      }
      case "Assignment":
      case "Definition": {
        return focusedShard.assignee;
      }
      default: {
        assertNever(focusedShard);
      }
    }
  };

  function focusShard(syntaxShard: AST.SyntaxShard) {
    setCommandForgeState({
      ...commandForgeState(),
      focusedShard: syntaxShard,
    });
  }

  function focusNextSiblingShard() {
    focusShard(focusedShardSibling("next"));
    scrollFocusedShardIntoView();
  }

  function focusPreviousSiblingShard() {
    focusShard(focusedShardSibling("previous"));
    scrollFocusedShardIntoView();
  }

  function changeShardValue<T extends AST.Primitive>(
    syntaxShard: T,
    value: T["value"],
  ) {
    syntaxShard.value = value;
    setCommandForgeState(imperativeUpdate);
  }

  function deleteShard(shard: AST.SyntaxShard): number {
    let shardIndex = -1;
    const shardParent = shard.parent as AST.ShardGroup;
    if (shardParent.contents) {
      shardIndex = shardParent.contents.findIndex(
        (syntaxShard) => syntaxShard === shard,
      );
      if (shardIndex === -1) {
        // @error
        // This case shouldn't happen!
        return shardIndex;
      }
      shardParent.contents = shardParent.contents.filter(
        (syntaxShard) => syntaxShard !== shard,
      ) as AST.ShardGroup["contents"];
    }
    setCommandForgeState(imperativeUpdate);

    return shardIndex;
  }

  function insertShardBefore(
    referenceShard: AST.SyntaxShard,
    shardToInsert: AST.SyntaxShard,
  ): number {
    let referenceShardIndex = -1;
    const referenceShardParent = referenceShard.parent as AST.ShardGroup;
    if (
      referenceShardParent.contents &&
      referenceShardParent === shardToInsert.parent &&
      referenceShard.type === shardToInsert.type
    ) {
      referenceShardIndex = referenceShardParent.contents.findIndex(
        (syntaxShard) => syntaxShard === referenceShard,
      );
      if (referenceShardIndex === -1) {
        // @error
        // This case shouldn't happen!
        return -1;
      }
      // @ts-expect-error: We're already checking above to make sure that the reference shard and the shard to insert are of the same type
      referenceShardParent.contents = [
        ...referenceShardParent.contents.slice(0, referenceShardIndex),
        shardToInsert,
        ...referenceShardParent.contents.slice(referenceShardIndex),
      ];

      return Math.max(referenceShardIndex - 1, 0);
    }

    return -1;
  }

  function insertShardAfter(
    referenceShard: AST.SyntaxShard,
    shardToInsert: AST.SyntaxShard,
  ): number {
    let referenceShardIndex = -1;
    const referenceShardParent = referenceShard.parent as AST.ShardGroup;
    if (
      referenceShardParent.contents &&
      referenceShardParent === shardToInsert.parent &&
      referenceShard.type === shardToInsert.type
    ) {
      referenceShardIndex = referenceShardParent.contents.findIndex(
        (syntaxShard) => syntaxShard === referenceShard,
      );
      if (referenceShardIndex === -1) {
        // @error
        // This case shouldn't happen!
        return -1;
      }
      // @ts-expect-error: We're already checking above to make sure that the reference shard and the shard to insert are of the same type
      referenceShardParent.contents = [
        ...referenceShardParent.contents.slice(0, referenceShardIndex + 1),
        shardToInsert,
        ...referenceShardParent.contents.slice(referenceShardIndex + 1),
      ];

      return Math.min(
        referenceShardIndex + 1,
        referenceShardParent.contents.length - 1,
      );
    }

    return -1;
  }

  function replaceShard(oldShard: AST.SyntaxShard, newShard: AST.SyntaxShard) {
    const newShardIndex = insertShardAfter(oldShard, newShard);
    if (newShardIndex === -1) {
      return -1;
    }
    deleteShard(oldShard);
    focusShard(newShard);
  }

  function replaceFocusedShard(newShard: AST.SyntaxShard) {
    const focusedShard = commandForgeState().focusedShard;
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }
    replaceShard(focusedShard, newShard);
  }

  function deleteFocusedShard() {
    const focusedShard = commandForgeState().focusedShard;
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }
    const focusedShardIndex = deleteShard(focusedShard);
    if (
      focusedShardIndex ===
      (focusedShard.parent as AST.ShardGroup).contents.length - 1
    ) {
      focusPreviousSiblingShard();
    } else {
      focusNextSiblingShard();
    }
  }

  function enterFocusedShard() {
    const focusedShard = commandForgeState().focusedShard;
    const _focusedShardImmediateChild = focusedShardImmediateChild();
    if (_focusedShardImmediateChild === undefined) {
      // @error
      // This case shouldn't happen!
      return;
    }
    // Check if null for primitive values
    if (_focusedShardImmediateChild !== null) {
      focusShard(_focusedShardImmediateChild);
      scrollFocusedShardIntoView();
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
      changeShardValue(focusedShard, !focusedShard.value);
    }
  }

  function exitFocusedShard() {
    const _commandForgeState = commandForgeState();
    if (
      _commandForgeState.focusedShard.parent === null ||
      _commandForgeState.focusedShard.parent.type === "Program"
    ) {
      return;
    }
    focusShard(_commandForgeState.focusedShard.parent);
    scrollFocusedShardIntoView();
  }

  function insertShardBeforeFocusedShardAndFocus() {
    const focusedShard = commandForgeState().focusedShard;
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }
    switch (focusedShard.parent.type) {
      case "Identifiers": {
        const identifier = generateIdentifier(focusedShard.parent);
        insertShardBefore(focusedShard, identifier);

        break;
      }
      case "Properties": {
        const property = generateProperty(focusedShard.parent);
        insertShardBefore(focusedShard, property);

        break;
      }
      case "Values": {
        const value = generateValue(focusedShard.parent);
        insertShardBefore(focusedShard, value);

        break;
      }
      case "Statements": {
        const statement = generateStatement(focusedShard.parent);
        insertShardBefore(focusedShard, statement);

        break;
      }
      default: {
        return;
      }
    }
    focusPreviousSiblingShard();
  }

  function insertShardAfterFocusedShardAndFocus() {
    const focusedShard = commandForgeState().focusedShard;
    if (
      focusedShard.parent === null ||
      focusedShard.parent.type === "Program"
    ) {
      return;
    }
    switch (focusedShard.parent.type) {
      case "Identifiers": {
        const identifier = generateIdentifier(focusedShard.parent);
        insertShardAfter(focusedShard, identifier);

        break;
      }
      case "Properties": {
        const property = generateProperty(focusedShard.parent);
        insertShardAfter(focusedShard, property);

        break;
      }
      case "Values": {
        const value = generateValue(focusedShard.parent);
        insertShardAfter(focusedShard, value);

        break;
      }
      case "Statements": {
        const statement = generateStatement(focusedShard.parent);
        insertShardAfter(focusedShard, statement);

        break;
      }
      case "Definition":
      case "Assignment":
      case "Call":
      case "Function":
      case "Property": {
        return;
      }
      default: {
        assertNever(focusedShard.parent);
      }
    }
    focusNextSiblingShard();
  }

  function scrollFocusedShardIntoView() {
    const viewportHeight = window.innerHeight;
    const elem = document.getElementById(commandForgeState().focusedShard.id);
    const elemHeight = elem?.getBoundingClientRect().height;
    const block = elemHeight && elemHeight > viewportHeight ? "start" : "end";
    elem?.scrollIntoView({ block, behavior: "smooth" });
  }

  return {
    commandForgeState,
    focusedShardSibling,
    focusedShardImmediateChild,
    focusNextSiblingShard,
    focusPreviousSiblingShard,
    changeShardValue,
    deleteShard,
    focusShard,
    insertShardBefore,
    insertShardAfter,
    replaceShard,
    replaceFocusedShard,
    deleteFocusedShard,
    enterFocusedShard,
    exitFocusedShard,
    insertShardBeforeFocusedShardAndFocus,
    insertShardAfterFocusedShardAndFocus,
    scrollFocusedShardIntoView,
  };
}
