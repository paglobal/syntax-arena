import { adaptRenderEffect, adaptState } from "promethium-js";
import { programUtils } from "./programUtils";
import { AST } from "./interpreter";
import { assertNever } from "@/utils";

const initialProgram = programUtils.generateProgram();

export const [commandForgeState, setCommandForgeState] = adaptState<{
  level: number;
  currentStatementsIndex: number;
  playing: boolean;
  program: AST.Program;
  focusedShard: AST.SyntaxShard;
}>({
  level: 0,
  currentStatementsIndex: 0,
  playing: false,
  program: initialProgram,
  focusedShard: initialProgram.body[0],
});

export const focusedShardSibling = (nextOrPrevious: "next" | "previous") => {
  const focusedShard = commandForgeState().focusedShard;

  // we shouldn't even get to the state where this condition is true in the first place
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
    case "Statements": {
      const focusedShardIndex = focusedShard.parent.contents.findIndex(
        (syntaxShard) => syntaxShard === focusedShard,
      );
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
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
        return focusedShard.parent.contents[Math.max(focusedShardIndex - 1, 0)];
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
    case "Program": {
      const focusedShardIndex = focusedShard.parent.body.findIndex(
        (syntaxShard) => syntaxShard === focusedShard,
      );
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
        return focusedShard;
      }
      if (nextOrPrevious === "next") {
        return focusedShard.parent.body[
          Math.min(focusedShardIndex + 1, focusedShard.parent.body.length - 1)
        ];
      } else {
        return focusedShard.parent.body[Math.max(focusedShardIndex - 1, 0)];
      }
    }
    default: {
      assertNever(focusedShard.parent);
    }
  }
};

export const focusedShardImmediateChild = () => {
  const focusedShard = commandForgeState().focusedShard;

  switch (focusedShard.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null":
      return null;
    case "Function":
      return focusedShard.parameters;
    case "Property":
      return focusedShard.key;
    case "Identifiers":
    case "Properties":
    case "Values":
    case "Statements":
      return focusedShard.contents[0];
    case "Call":
      return focusedShard.callee;
    case "Assignment":
    case "Definition":
      return focusedShard.assignee;
    case "Program":
      // @error
      // this case never be reached
      return focusedShard.body[0];
    default: {
      // @error
      // this case never be reached
      assertNever(focusedShard);
    }
  }
};
