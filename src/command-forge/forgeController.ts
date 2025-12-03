import { AST, interpret, Scope } from "./interpreter";
import { assertNever, mutateState } from "@/utils";
import { adaptState } from "promethium-js";
import { generateProgram } from "./shardGenerators";
import {
  getAllowedShardTypes,
  getShardRoleDetails,
  isPrimitive,
  isProgram,
  ShardGroupChild,
} from "./shardOperators";

export type CommandForgeController = ReturnType<typeof createForgeController>;

export function createForgeController(initialProgram?: AST.Program) {
  initialProgram = initialProgram ?? generateProgram();
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
        if (focusedShardIndex === -1) {
          // @error
          // This case shouldn't happen!
          return shard;
        }
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

  function focusNextSiblingShard(shard: AST.SyntaxShard) {
    focusShard(getShardSibling(shard, "next"));
  }

  function focusPreviousSiblingShard(shard: AST.SyntaxShard) {
    focusShard(getShardSibling(shard, "previous"));
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
    mutateState({
      fn: () => {
        shard.parent.contents = shard.parent.contents.filter(
          (syntaxShard) => syntaxShard !== shard,
        ) as AST.ShardGroup["contents"];
      },
      setState: setCommandForgeState,
    });
  }

  function insertShardBefore(
    referenceShard: ShardGroupChild,
    shardToInsert: ShardGroupChild,
  ) {
    if (
      referenceShard.parent === shardToInsert.parent &&
      referenceShard.type === shardToInsert.type
    ) {
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
    if (
      referenceShard.parent === shardToInsert.parent &&
      referenceShard.type === shardToInsert.type
    ) {
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

  function enterShard(shard: AST.SyntaxShard) {
    if (isProgram(shard)) {
      focusShard(shard);
    } else if (!isPrimitive(shard)) {
      focusShard(getShardImmediateChild(shard));
    } else if (shard.type === "String") {
    } else if (shard.type === "Number") {
    } else if (shard.type === "Boolean") {
      changeShardValue(shard, !shard.value);
    }
  }

  function exitShard(shard: AST.SyntaxShard) {
    if (!isProgram(shard)) {
      focusShard(shard.parent);
    }
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
    focusNextSiblingShard,
    focusPreviousSiblingShard,
    changeShardValue,
    deleteShard,
    focusShard,
    insertShardBefore,
    insertShardAfter,
    replaceShard,
    enterShard,
    exitShard,
    executeProgram,
  };
}
