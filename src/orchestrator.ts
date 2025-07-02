import { mazeGraphics, mazeLayer } from "./maze";
import { Application } from "pixi.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "./constants";
import { adaptState } from "promethium-js";
import { drawPlayerGraphics } from "./player";
import { getCSSVariable } from "./renderUtils";
import { drawEnemiesGraphics } from "./enemies";
import { drawKeysGraphics } from "./keys";
import { drawPowerUpsGraphics } from "./powerUps";
import { Program, SyntaxShard } from "./interpreter";
import { keybindingUtils, programUtils } from "./orchestratorUtils";
import hotkeys from "hotkeys-js";

export const [orchestratorState, setOrchestratorState] = adaptState({
  level: 0,
  currentStatementsIndex: 0,
  playing: false,
});

export const [program, setProgram] = adaptState<Program>([
  programUtils.generateStatements(),
]);

export const currentStatements = () => {
  return program()[orchestratorState().currentStatementsIndex];
};

export const [focusedShardPath, setFocusedShardPath] = adaptState<
  SyntaxShard[]
>([currentStatements()]);

export const focusedShard = () => {
  const _focusedShardPath = focusedShardPath();

  return _focusedShardPath[Math.max(_focusedShardPath.length - 1, 0)];
};

export const focusedShardParent = () => {
  const _focusedShardPath = focusedShardPath();

  return _focusedShardPath[Math.max(_focusedShardPath.length - 2, 0)];
};

export const focusedShardSibling = (nextOrPrevious: "next" | "previous") => {
  const _focusedShard = focusedShard();
  const _focusedShardParent = focusedShardParent();

  if (_focusedShard === _focusedShardParent) {
    return _focusedShardParent;
  }

  switch (_focusedShardParent.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null":
    case "Identifier":
      // @error
      // this case shouldn't happen!
      return _focusedShard;
    case "Function":
      switch (_focusedShard.type) {
        // for parameters
        case "Identifiers":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.body;
          } else {
            return _focusedShardParent.parameters;
          }
        // for body
        case "Statements":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.return;
          } else {
            return _focusedShardParent.parameters;
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
        case "Function":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.return;
          } else {
            return _focusedShardParent.body;
          }
        default:
          // @error
          // this case shouldn't happen!
          return _focusedShard;
      }
    case "Property":
      switch (_focusedShard.type) {
        // for key
        case "Identifier":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.key;
          }
        // for expression
        case "String":
        case "Number":
        case "Boolean":
        case "Null":
        case "Identifier":
        case "Call":
        case "Properties":
        case "Values":
        case "Function":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.key;
          }
        default:
          // @error
          // this case shouldn't happen!
          return _focusedShard;
      }
    case "Identifiers":
    case "Properties":
    case "Values":
    case "Statements":
      const focusedShardIndex = _focusedShardParent.contents.findIndex(
        (syntaxShard) => syntaxShard === _focusedShard,
      );
      if (focusedShardIndex === -1) {
        // @error
        // this case shouldn't happen!
      }
      if (nextOrPrevious === "next") {
        return _focusedShardParent.contents[
          Math.min(
            focusedShardIndex + 1,
            _focusedShardParent.contents.length - 1,
          )
        ];
      } else {
        return _focusedShardParent.contents[Math.max(focusedShardIndex - 1, 0)];
      }
    case "Call":
      switch (_focusedShard.type) {
        // for callee
        case "Identifiers":
        case "Function":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.arguments;
          } else {
            return _focusedShardParent.callee;
          }
        // for arguments
        case "Values":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.arguments;
          } else {
            return _focusedShardParent.callee;
          }
        default:
          // @error
          // this case shouldn't happen!
          return _focusedShard;
      }
    case "Assignment":
      switch (_focusedShard.type) {
        // for assignee
        case "Identifiers":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.assignee;
          }
        // for expression
        case "String":
        case "Number":
        case "Boolean":
        case "Null":
        case "Identifier":
        case "Call":
        case "Properties":
        case "Values":
        case "Function":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.assignee;
          }
        default:
          // @error
          // this case shouldn't happen!
          return _focusedShard;
      }
    case "Definition":
      switch (_focusedShard.type) {
        // for assignee
        case "Identifier":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.assignee;
          }
        // for expression
        case "String":
        case "Number":
        case "Boolean":
        case "Null":
        case "Identifier":
        case "Call":
        case "Properties":
        case "Values":
        case "Function":
          if (nextOrPrevious === "next") {
            return _focusedShardParent.expression;
          } else {
            return _focusedShardParent.assignee;
          }
        default:
          // @error
          // this case shouldn't happen!
          return _focusedShard;
      }
    default:
      // @error
      // this case never be reached
      return _focusedShard;
  }
};

export const focusedShardImmediateChild = () => {
  const _focusedShard = focusedShard();

  switch (_focusedShard.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null":
    case "Identifier":
      return null;
    case "Function":
      return _focusedShard.parameters;
    case "Property":
      return _focusedShard.key;
    case "Identifiers":
    case "Properties":
    case "Values":
    case "Statements":
      return _focusedShard.contents[0];
    case "Call":
      return _focusedShard.callee;
    case "Assignment":
    case "Definition":
      return _focusedShard.assignee;
  }
};

function initializeKeybindings() {
  hotkeys.filter = function (e) {
    const target = e.target;
    const tagName = (target as HTMLElement)?.tagName;

    return !(tagName == "SL-INPUT");
  };

  hotkeys("h,left,esc", keybindingUtils.exitFocusedShard);
  hotkeys("l,right,enter", keybindingUtils.enterFocusedShard);
  hotkeys("j,down", keybindingUtils.focusNextSiblingShard);
  hotkeys("k,up", keybindingUtils.focusPreviousSiblingShard);
  hotkeys("a", keybindingUtils.addShardInFrontOfFocusedShardAndFocus);
  hotkeys("i", keybindingUtils.addShardBehindFocusedShardAndFocus);
  hotkeys("d", keybindingUtils.deleteFocusedShard);
  // hotkeys("b", keybindingUtils.toggleFocusedShardDisplayStyle);
  hotkeys("t", keybindingUtils.toggleFocusedShardType);
  hotkeys("e", keybindingUtils.executeFocusedStatements);
  hotkeys("space", keybindingUtils.toggleGameLoopPlayingState);
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

  app.ticker.add((ticker) => {
    // update playerGraphics
    // update maze
    // update enemy graphics
    // update powerUp graphics
  });
}
