import { AST } from "./interpreter";
import { NamedContainer } from "./NamedContainer";
import { CommandForgeController } from ".";
import { assertNever } from "@/utils";
import { NamedBadge } from "./NamedBadge";

const emptyTextPlaceholder = <span>{"\u2205"}</span>;

export function SyntaxShard(props: {
  syntaxShard: AST.SyntaxShard;
  commandForgeController: CommandForgeController;
}) {
  function focusOrEnterShard() {
    const _orchestratorState = props.commandForgeController.commandForgeState();
    if (_orchestratorState.focusedShard === props.syntaxShard) {
      switch (props.syntaxShard.type) {
        case "String":
        case "Number":
        case "Boolean":
          props.commandForgeController.enterFocusedShard();
          break;
        case "Null":
        case "Function":
        case "Property":
        case "Identifiers":
        case "Properties":
        case "Values":
        case "Call":
        case "Assignment":
        case "Definition":
        case "Statements":
        case "Program":
          break;
        default: {
          assertNever(props.syntaxShard);
        }
      }
    } else {
      props.commandForgeController.focusShard(props.syntaxShard);
    }
  }

  return () => {
    const focusedShard =
      props.commandForgeController.commandForgeState().focusedShard;
    const namedElementProps = {
      id: props.syntaxShard.id,
      name: props.syntaxShard.type,
      focused: props.syntaxShard === focusedShard,
      onClick: focusOrEnterShard,
    };

    return props.syntaxShard.type === "Call" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard
          syntaxShard={props.syntaxShard.callee}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
        <SyntaxShard
          syntaxShard={props.syntaxShard.arguments}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Assignment" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard
          syntaxShard={props.syntaxShard.assignee}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
        <SyntaxShard
          syntaxShard={props.syntaxShard.expression}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Definition" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard
          syntaxShard={props.syntaxShard.assignee}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
        <SyntaxShard
          syntaxShard={props.syntaxShard.expression}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Statements" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((statement) => (
          <SyntaxShard
            syntaxShard={statement}
            commandForgeController={props.commandForgeController}
          ></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Function" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard
          syntaxShard={props.syntaxShard.parameters}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
        <SyntaxShard
          syntaxShard={props.syntaxShard.body}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Properties" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((property) => (
          <SyntaxShard
            syntaxShard={property}
            commandForgeController={props.commandForgeController}
          ></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Values" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((value) => (
          <SyntaxShard
            syntaxShard={value}
            commandForgeController={props.commandForgeController}
          ></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifiers" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((identifier) => (
          <SyntaxShard
            syntaxShard={identifier}
            commandForgeController={props.commandForgeController}
          ></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Property" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard
          syntaxShard={props.syntaxShard.key}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
        <SyntaxShard
          syntaxShard={props.syntaxShard.expression}
          commandForgeController={props.commandForgeController}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "String" ? (
      <NamedBadge {...namedElementProps} variant="warning">
        {props.syntaxShard.value === ""
          ? emptyTextPlaceholder
          : props.syntaxShard.value}
      </NamedBadge>
    ) : props.syntaxShard.type === "Number" ? (
      <NamedBadge {...namedElementProps} variant="brand">
        {props.syntaxShard.value}
      </NamedBadge>
    ) : props.syntaxShard.type === "Boolean" ? (
      <NamedBadge
        {...namedElementProps}
        variant={props.syntaxShard.value === true ? "success" : "danger"}
      >
        {props.syntaxShard.value}
      </NamedBadge>
    ) : props.syntaxShard.type === "Null" ? (
      <NamedBadge {...namedElementProps} variant="neutral">
        null
      </NamedBadge>
    ) : null;
  };
}
