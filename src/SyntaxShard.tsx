import { AST } from "./interpreter";
import { NamedContainer } from "./NamedContainer";
import {
  orchestratorState,
  setOrchestratorState,
} from "./orchestrator/orchestrator";

export function SyntaxShard(props: {
  name?: string;
  syntaxShard: AST.SyntaxShard;
}) {
  function focusShard() {
    const _orchestratorState = orchestratorState();
    setOrchestratorState({
      ..._orchestratorState,
      focusedShard: props.syntaxShard,
    });
  }

  return () =>
    props.syntaxShard.type === "Call" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={`Statement - ${props.syntaxShard.type}`}
        onFocus={focusShard}
      >
        <SyntaxShard
          name={`Callee - ${props.syntaxShard.callee.type}`}
          syntaxShard={props.syntaxShard.callee}
        ></SyntaxShard>
        <SyntaxShard
          name={`Arguments - ${props.syntaxShard.arguments.type}`}
          syntaxShard={props.syntaxShard.arguments}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Assignment" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={`Statement - ${props.syntaxShard.type}`}
        onFocus={focusShard}
      >
        <SyntaxShard
          name={`Assignee - ${props.syntaxShard.assignee.type}`}
          syntaxShard={props.syntaxShard.assignee}
        ></SyntaxShard>
        <SyntaxShard
          name={`Expression - ${props.syntaxShard.expression.type}`}
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Definition" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={`Statement - ${props.syntaxShard.type}`}
        onFocus={focusShard}
      >
        <SyntaxShard
          name={`Assignee - ${props.syntaxShard.assignee.type}`}
          syntaxShard={props.syntaxShard.assignee}
        ></SyntaxShard>
        <SyntaxShard
          name={`Expression - ${props.syntaxShard.expression.type}`}
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Statements" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.contents.map((statement) => (
          <SyntaxShard syntaxShard={statement}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Function" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        <SyntaxShard
          name={`Parameters - ${props.syntaxShard.parameters.type}`}
          syntaxShard={props.syntaxShard.parameters}
        ></SyntaxShard>
        <SyntaxShard
          name={`Body - ${props.syntaxShard.body.type}`}
          syntaxShard={props.syntaxShard.body}
        ></SyntaxShard>
        <SyntaxShard
          name={`Return - ${props.syntaxShard.return.type}`}
          syntaxShard={props.syntaxShard.return}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Properties" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.contents.map((property) => (
          <SyntaxShard syntaxShard={property}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Values" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.contents.map((value) => (
          <SyntaxShard syntaxShard={value}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifiers" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.contents.map((identifier) => (
          <SyntaxShard syntaxShard={identifier}></SyntaxShard>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Property" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        <SyntaxShard
          name={`Key - ${props.syntaxShard.key.type}`}
          syntaxShard={props.syntaxShard.key}
        ></SyntaxShard>
        <SyntaxShard
          name={`Expression - ${props.syntaxShard.expression.type}`}
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShard>
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifier" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.name}
      </NamedContainer>
    ) : props.syntaxShard.type === "Program" ? null : (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.syntaxShard.type}
        onFocus={focusShard}
      >
        {props.syntaxShard.value}
      </NamedContainer>
    );
}
