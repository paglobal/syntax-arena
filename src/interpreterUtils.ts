import {
  ExecutionContext,
  Identifier,
  Identifiers,
  Scope,
  Value,
} from "./interpreter";

export function findScopeForIdentifier({
  identifier,
  context,
}: {
  identifier: Identifier;
  context: ExecutionContext;
}) {
  identifier;
  context;
}

export function resolveReference({
  identifiersContent,
  context,
}: {
  identifiersContent: Identifiers["content"];
  context: ExecutionContext;
}) {
  identifiersContent;
  context;
}

export function resolveValue({
  value,
  context,
}: {
  value: Value;
  context: ExecutionContext;
}) {
  value;
  context;
}

export function createExecutionContext(parentContext: ExecutionContext) {
  const newContext: ExecutionContext = {
    scope: new Map<string, Value>(),
    parent: parentContext,
  };

  return newContext;
}

export function assignValueToIdentifier({
  assignee,
  resolvedValue,
  context,
}: {
  assignee: Identifiers;
  resolvedValue: unknown;
  context: ExecutionContext;
}) {
  assignee;
  resolvedValue;
  context;
}
