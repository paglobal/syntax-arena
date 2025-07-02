import { SyntaxShard } from "./interpreter";
import { NamedContainer } from "./NamedContainer";

export function SyntaxShardView(props: {
  name?: string;
  syntaxShard: SyntaxShard;
}) {
  return () =>
    props.syntaxShard.type === "Call" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.name ?? `Statement - ${props.syntaxShard.type}`}
      >
        <SyntaxShardView
          name={`Callee - ${props.syntaxShard.callee.type}`}
          syntaxShard={props.syntaxShard.callee}
        ></SyntaxShardView>
        <SyntaxShardView
          name={`Arguments - ${props.syntaxShard.arguments.type}`}
          syntaxShard={props.syntaxShard.arguments}
        ></SyntaxShardView>
      </NamedContainer>
    ) : props.syntaxShard.type === "Assignment" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.name ?? `Statement - ${props.syntaxShard.type}`}
      >
        <SyntaxShardView
          name={`Assignee - ${props.syntaxShard.assignee.type}`}
          syntaxShard={props.syntaxShard.assignee}
        ></SyntaxShardView>
        <SyntaxShardView
          name={`Expression - ${props.syntaxShard.expression.type}`}
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShardView>
      </NamedContainer>
    ) : props.syntaxShard.type === "Definition" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.name ?? `Statement - ${props.syntaxShard.type}`}
      >
        <SyntaxShardView
          name={`Assignee - ${props.syntaxShard.assignee.type}`}
          syntaxShard={props.syntaxShard.assignee}
        ></SyntaxShardView>
        <SyntaxShardView
          name={`Expression - ${props.syntaxShard.expression.type}`}
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShardView>
      </NamedContainer>
    ) : props.syntaxShard.type === "Statements" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.contents.map((statement) => (
          <SyntaxShardView syntaxShard={statement}></SyntaxShardView>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Function" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        display="block"
        name={props.name ?? props.syntaxShard.type}
      >
        <SyntaxShardView
          name={`Parameters - ${props.syntaxShard.parameters.type}`}
          syntaxShard={props.syntaxShard.parameters}
        ></SyntaxShardView>
        <SyntaxShardView
          name={`Body - ${props.syntaxShard.body.type}`}
          syntaxShard={props.syntaxShard.body}
        ></SyntaxShardView>
        <SyntaxShardView
          name={`Return - ${props.syntaxShard.return.type}`}
          syntaxShard={props.syntaxShard.return}
        ></SyntaxShardView>
      </NamedContainer>
    ) : props.syntaxShard.type === "Properties" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.contents.map((property) => (
          <SyntaxShardView syntaxShard={property}></SyntaxShardView>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Values" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.contents.map((value) => (
          <SyntaxShardView syntaxShard={value}></SyntaxShardView>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifiers" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.contents.map((identifier) => (
          <SyntaxShardView syntaxShard={identifier}></SyntaxShardView>
        ))}
      </NamedContainer>
    ) : props.syntaxShard.type === "Property" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        <SyntaxShardView
          name={props.name ?? `Key - ${props.syntaxShard.key.type}`}
          syntaxShard={props.syntaxShard.key}
        ></SyntaxShardView>
        <SyntaxShardView
          name={
            props.name ?? `Expression - ${props.syntaxShard.expression.type}`
          }
          syntaxShard={props.syntaxShard.expression}
        ></SyntaxShardView>
      </NamedContainer>
    ) : props.syntaxShard.type === "Identifier" ? (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.name}
      </NamedContainer>
    ) : (
      <NamedContainer
        id={props.syntaxShard.id}
        name={props.name ?? props.syntaxShard.type}
      >
        {props.syntaxShard.value}
      </NamedContainer>
    );
}
