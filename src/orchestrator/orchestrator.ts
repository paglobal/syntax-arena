import { mazeGraphics, mazeLayer } from "@/arena/maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "@/constants";
import { adaptRenderEffect, adaptState } from "promethium-js";
import { drawPlayerGraphics } from "@/arena/player";
import { getCSSVariable } from "@/utils";
import { drawEnemiesGraphics } from "@/arena/enemies";
import { drawKeysGraphics } from "@/arena/keys";
import { drawPowerUpsGraphics } from "@/arena/powerUps";
import { AST } from "@/strategy-sandbox/command-forge/interpreter";
import { actions } from "./actions";
import hotkeys from "hotkeys-js";
import { assertNever } from "@/utils";
import { programUtils } from "./programUtils";

const initialProgram = programUtils.generateProgram();

export const [orchestratorState, setOrchestratorState] = adaptState<{
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

adaptRenderEffect(() => {
  // const viewportHeight = window.innerHeight;
  // const elem = document.getElementById(orchestratorState().focusedShard.id);
  // const elemHeight = elem?.getBoundingClientRect().height;
  //
  // const block = elemHeight && elemHeight > viewportHeight ? "start" : "end";
  //
  // elem?.parentElement?.scrollIntoView({ block, behavior: "smooth" });
});

export const focusedShardSibling = (nextOrPrevious: "next" | "previous") => {
  const focusedShard = orchestratorState().focusedShard;

  // we shouldn't even get to the state where this condition is true in the first place
  if (focusedShard.parent === null) {
    return focusedShard;
  }

  switch (focusedShard.parent.type) {
    case "Function": {
      switch (focusedShard.type) {
        // for parameters
        case "Identifiers": {
          if (nextOrPrevious === "next") {
            return focusedShard.parent.body;
          } else {
            return focusedShard.parent.parameters;
          }
        }
        // for body
        case "Statements": {
          if (nextOrPrevious === "next") {
            return focusedShard.parent.return;
          } else {
            return focusedShard.parent.parameters;
          }
        }
        // for return
        case "String":
        case "Number":
        case "Boolean":
        case "Null":
        case "Identifier":
        case "Call":
        case "Properties":
        case "Values":
        case "Function": {
          if (nextOrPrevious === "next") {
            return focusedShard.parent.return;
          } else {
            return focusedShard.parent.body;
          }
        }
        case "Definition":
        case "Assignment":
        case "Property":
          return focusedShard;
        default: {
          assertNever(focusedShard);
        }
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
  const focusedShard = orchestratorState().focusedShard;

  switch (focusedShard.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null":
    case "Identifier":
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

function initializeKeybindings() {
  hotkeys.filter = function (e) {
    const target = e.target;
    const tagName = (target as HTMLElement)?.tagName;

    return !(tagName == "SL-INPUT");
  };

  hotkeys("h,left,esc", actions.exitFocusedShard);
  hotkeys("l,right,enter", actions.enterFocusedShard);
  hotkeys("j,down", actions.focusNextSiblingShard);
  hotkeys("k,up", actions.focusPreviousSiblingShard);
  hotkeys("a", actions.addShardInFrontOfFocusedShardAndFocus);
  hotkeys("i", actions.addShardBehindFocusedShardAndFocus);
  hotkeys("d", actions.deleteFocusedShard);
  hotkeys("b", actions.toggleFocusedShardDisplayStyle);
  hotkeys("t", actions.toggleFocusedShardType);
  hotkeys("e", actions.executeFocusedStatements);
  hotkeys("space", actions.toggleGameLoopPlayingState);
}

export async function initializeGame(canvas?: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    autoStart: true,
    background: getCSSVariable("--sl-color-neutral-0"),
    canvas,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
  });

  app.stage.addChild(mazeLayer);
  app.stage.addChild(mazeGraphics);

  drawPowerUpsGraphics(app.stage);
  drawKeysGraphics(app.stage);
  drawEnemiesGraphics(app.stage);
  drawPlayerGraphics(app.stage);

  initializeKeybindings();

  app.ticker.add(() => {
    // update playerGraphics
    // update maze
    // update enemy graphics
    // update powerUp graphics
  });
}
