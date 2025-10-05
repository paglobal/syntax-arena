import { AST } from "./interpreter";
import { NamedContainer } from "./NamedContainer";
import { actions } from "@/orchestrator/actions";
import {
  orchestratorState,
  setOrchestratorState,
} from "@/orchestrator/orchestrator";
import { assertNever } from "@/utils";
import { NamedBadge } from "./NamedBadge";

const emptyTextPlaceholder = <span>{"\u2205"}</span>;

export function SyntaxShard(props: { syntaxShard: AST.SyntaxShard }) {
  function focusOrEnterShard() {
    const _orchestratorState = orchestratorState();
    if (_orchestratorState.focusedShard === props.syntaxShard) {
      switch (props.syntaxShard.type) {
        case "String":
        case "Number":
        case "Boolean":
        case "Identifier":
          actions.enterFocusedShard();
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
        default:
          assertNever(props.syntaxShard);
      }
    } else {
      setOrchestratorState({
        ..._orchestratorState,
        focusedShard: props.syntaxShard,
      });
    }
  }

  return () => {
    const focusedShard = orchestratorState().focusedShard;
    const namedElementProps = {
      id: props.syntaxShard.id,
      display: props.syntaxShard.display,
      name: props.syntaxShard.type,
      focused: props.syntaxShard === focusedShard,
      onClick: focusOrEnterShard,
    };

    return props.syntaxShard.type === "Call" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard syntaxShard={props.syntaxShard.callee}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.arguments}></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Assignment" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard syntaxShard={props.syntaxShard.assignee}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.expression}></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Definition" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard syntaxShard={props.syntaxShard.assignee}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.expression}></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Statements" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((statement) => (
          <SyntaxShard syntaxShard={statement}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Function" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard syntaxShard={props.syntaxShard.parameters}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.body}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.return}></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Properties" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((property) => (
          <SyntaxShard syntaxShard={property}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Values" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((value) => (
          <SyntaxShard syntaxShard={value}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifiers" ? (
      <NamedContainer {...namedElementProps}>
        {props.syntaxShard.contents.map((identifier) => (
          <SyntaxShard syntaxShard={identifier}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Property" ? (
      <NamedContainer {...namedElementProps}>
        <SyntaxShard syntaxShard={props.syntaxShard.key}></SyntaxShard>
        <SyntaxShard syntaxShard={props.syntaxShard.expression}></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifier" ? (
      <NamedBadge {...namedElementProps} variant="warning">
        {props.syntaxShard.name === ""
          ? emptyTextPlaceholder
          : props.syntaxShard.name}
      </NamedBadge>
    ) : props.syntaxShard.type === "String" ? (
      <NamedBadge {...namedElementProps} variant="warning">
        {props.syntaxShard.value === ""
          ? emptyTextPlaceholder
          : props.syntaxShard.value}
      </NamedBadge>
    ) : props.syntaxShard.type === "Number" ? (
      <NamedBadge {...namedElementProps} variant="primary">
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
