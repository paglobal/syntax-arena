import { AST, interpret, Scope } from "./interpreter";
import { assertNever, mutateState } from "@/utils";
import { adaptState } from "promethium-js";
import * as sg from "./shardGenerators";
import {
  getAllowedShardTypes,
  getShardRoleDetails,
  isInShardGroup,
  isPrimitive,
  isProgram,
  ShardGroupChild,
} from "./shardOperators";

type CreateAction<I extends string> = {
  id: I;
  execute: () => Interactions.Result;
};

type OptionsElements = unknown[];

type CreateOptions<I extends string, E extends OptionsElements> = {
  type: "options";
  id: I;
  elements: E;
  select: (element: E[number]) => Interactions.Result;
};

export namespace Interactions {
  export type Result = Options | Input | void;

  export type Action =
    | CreateAction<"delete">
    | CreateAction<"replace">
    | CreateAction<"enter">
    | CreateAction<"exit">
    | CreateAction<"changeValue">
    | CreateAction<"insertBefore">
    | CreateAction<"insertAfter">;

  export type Options =
    | CreateOptions<"insertBeforeWith", AST.SyntaxShard["type"][]>
    | CreateOptions<"insertAfterWith", AST.SyntaxShard["type"][]>
    | CreateOptions<"replaceWith", AST.SyntaxShard["type"][]>;

  type InputCurrentValue = string | number;

  export type Input = {
    type: "input";
    currentValue: InputCurrentValue;
    change: (newValue: InputCurrentValue) => Result;
  };
}

export type CommandForgeController = ReturnType<typeof createForgeController>;

export function createForgeController(initialProgram?: AST.Program) {
  initialProgram = initialProgram ?? sg.generateProgram();
  const [commandForgeState, setCommandForgeState] = adaptState<{
    currentStatementsIndex: number;
    program: AST.Program;
    focusedShard: AST.SyntaxShard;
  }>({
    currentStatementsIndex: 0,
    program: initialProgram,
    focusedShard: initialProgram,
  });

  function getShardSibling(
    shard: AST.SyntaxShard,
    nextOrPrevious: "next" | "previous",
  ) {
    if (shard.parent === null) {
      return shard;
    }
    switch (shard.parent.type) {
      case "Function": {
        if (nextOrPrevious === "next") {
          return shard.parent.body;
        } else {
          return shard.parent.parameters;
        }
      }
      case "Property": {
        if (nextOrPrevious === "next") {
          return shard.parent.expression;
        } else {
          return shard.parent.key;
        }
      }
      case "Identifiers":
      case "Properties":
      case "Values":
      case "Statements": {
        const focusedShardIndex = shard.parent.contents.findIndex(
          (syntaxShard) => syntaxShard === shard,
        );
        if (nextOrPrevious === "next") {
          return shard.parent.contents[
            Math.min(focusedShardIndex + 1, shard.parent.contents.length - 1)
          ];
        } else {
          return shard.parent.contents[Math.max(focusedShardIndex - 1, 0)];
        }
      }
      case "Call": {
        if (nextOrPrevious === "next") {
          return shard.parent.arguments;
        } else {
          return shard.parent.callee;
        }
      }
      case "Assignment":
      case "Definition": {
        if (nextOrPrevious === "next") {
          return shard.parent.expression;
        } else {
          return shard.parent.assignee;
        }
      }
      case "Program": {
        return shard.parent.body;
      }
      default: {
        assertNever(shard.parent);
      }
    }
  }

  function getShardImmediateChild(shard: AST.SyntaxShard) {
    switch (shard.type) {
      case "String":
      case "Number":
      case "Boolean":
      case "Null": {
        return shard;
      }
      case "Function": {
        return shard.parameters;
      }
      case "Property": {
        return shard.key;
      }
      case "Identifiers":
      case "Properties":
      case "Values":
      case "Statements": {
        return shard.contents[0];
      }
      case "Call": {
        return shard.callee;
      }
      case "Assignment":
      case "Definition": {
        return shard.assignee;
      }
      case "Program": {
        return shard.body;
      }
      default: {
        assertNever(shard);
      }
    }
  }

  function focusShard(syntaxShard: AST.SyntaxShard) {
    setCommandForgeState({
      ...commandForgeState(),
      focusedShard: syntaxShard,
    });
  }

  function changeShardValue<T extends AST.PrimitiveShard>(
    shard: T,
    value: T["value"],
  ) {
    mutateState({
      fn: () => {
        shard.value = value;
      },
      setState: setCommandForgeState,
    });
  }

  function deleteShard(shard: ShardGroupChild) {
    if (shard.parent.contents.length > 1) {
      mutateState({
        fn: () => {
          shard.parent.contents = shard.parent.contents.filter(
            (syntaxShard) => syntaxShard !== shard,
          ) as AST.ShardGroup["contents"];
        },
        setState: setCommandForgeState,
      });
    }
  }

  function insertShardBefore(
    referenceShard: ShardGroupChild,
    shardToInsert: ShardGroupChild,
  ) {
    if (referenceShard.parent === shardToInsert.parent) {
      const referenceShardIndex = referenceShard.parent.contents.findIndex(
        (syntaxShard) => syntaxShard === referenceShard,
      );
      mutateState({
        fn: () => {
          referenceShard.parent.contents = [
            ...referenceShard.parent.contents.slice(0, referenceShardIndex),
            shardToInsert,
            ...referenceShard.parent.contents.slice(referenceShardIndex),
          ] as AST.ShardGroup["contents"];
        },
        setState: setCommandForgeState,
      });
    }
  }

  function insertShardAfter(
    referenceShard: ShardGroupChild,
    shardToInsert: ShardGroupChild,
  ) {
    if (referenceShard.parent === shardToInsert.parent) {
      const referenceShardIndex = referenceShard.parent.contents.findIndex(
        (syntaxShard) => syntaxShard === referenceShard,
      );
      mutateState({
        fn: () => {
          referenceShard.parent.contents = [
            ...referenceShard.parent.contents.slice(0, referenceShardIndex + 1),
            shardToInsert,
            ...referenceShard.parent.contents.slice(referenceShardIndex + 1),
          ] as AST.ShardGroup["contents"];
        },
        setState: setCommandForgeState,
      });
    }
  }

  function replaceShard(oldShard: AST.SyntaxShard, newShard: AST.SyntaxShard) {
    if (isProgram(oldShard)) {
      return;
    }
    const oldShardRole = getShardRoleDetails(oldShard).role;
    if (oldShardRole === null) {
      return;
    }
    const oldShardParentAllowedShardTypes = getAllowedShardTypes(
      oldShard.parent,
      oldShardRole,
    );
    if (oldShardParentAllowedShardTypes.includes(newShard.type)) {
      mutateState({
        fn: () => {
          if (oldShardRole === "contents") {
            insertShardBefore(
              oldShard as ShardGroupChild,
              newShard as ShardGroupChild,
            );
            deleteShard(oldShard as ShardGroupChild);
          } else {
            oldShard.parent[oldShardRole] = newShard as never;
          }
        },
        setState: setCommandForgeState,
      });
    }
  }

  function getActionsForShard(shard: AST.SyntaxShard): Interactions.Action[] {
    const actions: Interactions.Action[] = [];
    if (isInShardGroup(shard)) {
      actions.push({
        id: "delete",
        execute() {
          deleteShard(shard);
        },
      });
      actions.push({
        id: "insertBefore",
        execute() {
          const allowedShardTypes = getAllowedShardTypes(
            shard.parent,
            "contents",
          );

          return {
            type: "options",
            id: "insertBeforeWith",
            elements: allowedShardTypes,
            select: (shardType) => {
              const newShard = sg[`generate${shardType}`](
                shard.parent as never,
              );
              insertShardBefore(shard, newShard as ShardGroupChild);
            },
          };
        },
      });
      actions.push({
        id: "insertAfter",
        execute() {
          const allowedShardTypes = getAllowedShardTypes(
            shard.parent,
            "contents",
          );

          return {
            type: "options",
            id: "insertAfterWith",
            elements: allowedShardTypes,
            select: (shardType) => {
              const newShard = sg[`generate${shardType}`](
                shard.parent as never,
              );
              insertShardAfter(shard, newShard as ShardGroupChild);
            },
          };
        },
      });
    }
    if (isPrimitive(shard)) {
      if (shard.type !== "Null") {
        actions.push({
          id: "changeValue",
          execute() {
            if (shard.type === "Boolean") {
              changeShardValue(shard, !shard.value);
            } else {
              return {
                type: "input",
                currentValue: shard.value,
                change: (newValue) => {
                  changeShardValue(shard, newValue);
                },
              };
            }
          },
        });
      }
    }
    actions.push({
      id: "enter",
      execute() {
        focusShard(getShardImmediateChild(shard));
      },
    });
    actions.push({
      id: "exit",
      execute() {
        focusShard(shard.parent ?? shard);
      },
    });
    if (!isProgram(shard)) {
      const role = getShardRoleDetails(shard).role;
      if (role !== null) {
        const allowedShardTypes = getAllowedShardTypes(
          shard.parent,
          role,
        ).filter((shardType) => shardType !== shard.type);
        if (allowedShardTypes.length > 1) {
          actions.push({
            id: "replace",
            execute() {
              return {
                type: "options",
                id: "replaceWith",
                elements: allowedShardTypes,
                select: (shardType) => {
                  const newShard = sg[`generate${shardType}`](
                    shard.parent as never,
                  );
                  replaceShard(shard, newShard);
                },
              };
            },
          });
        }
      }
    }

    return actions;
  }

  type ExecuteProgramGenerator = Generator<
    { type: "shard"; data: AST.SyntaxShard } | { type: "error"; data: string },
    void,
    void
  >;

  function* executeProgram(scope?: Scope): ExecuteProgramGenerator {
    const _commandForgeState = commandForgeState();
    const statements = _commandForgeState.program.body;
    scope = scope ?? new Map();
    const context = { scope };
    try {
      for (const shard of interpret({ statements, context })) {
        yield { type: "shard", data: shard };
      }
    } catch (error) {
      yield {
        type: "error",
        data: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    commandForgeState,
    getShardSibling,
    getShardImmediateChild,
    changeShardValue,
    deleteShard,
    focusShard,
    insertShardBefore,
    insertShardAfter,
    replaceShard,
    getActionsForShard,
    executeProgram,
  };
}
