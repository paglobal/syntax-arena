import { assignValueToIdentifier, resolveValue } from "./interpreterUtils";

type SyntaxShard<T extends string, U extends Record<string, unknown>> = {
  id: string;
  type: T;
} & U;

type Str = SyntaxShard<"String", { value: string }>;

type Num = SyntaxShard<"Number", { value: number }>;

type Bool = SyntaxShard<"Boolean", { value: boolean }>;

export type Identifier = SyntaxShard<"Identifier", { name: string }>;

export type Identifiers = SyntaxShard<"Identifiers", { content: Identifier[] }>;

type Property = SyntaxShard<"Property", { key: Identifier; value: Value }>;

type Obj = SyntaxShard<"Object", { properties: Property[] }>;

type Arr = SyntaxShard<"Array", { elements: Value[] }>;

type Call = SyntaxShard<
  "Call",
  {
    callee: Identifiers;
    arguments: Values;
  }
>;

type Assignment = SyntaxShard<
  "Assignment",
  {
    assignee: Identifiers;
    value: Value;
  }
>;

type Definition = SyntaxShard<
  "Definition",
  {
    assignee: Identifier;
    value: Value;
  }
>;

type Statement = Definition | Assignment | Call;

type Statements = SyntaxShard<"Statements", { content: Statement[] }>;

export type Fn = {
  type: "Function";
  parameters: Identifiers;
  body: Statements;
  return: Value;
};

export type Value = Str | Num | Bool | Identifiers | Call | Obj | Arr | Fn;

type Values = SyntaxShard<"Values", { content: Value[] }>;

type AST = Statements[];

export type Scope = Map<string, unknown>;

export type ExecutionContext = { parent?: ExecutionContext; scope: Scope };

export function interpretCall({
  call,
  context,
}: {
  call: Call;
  context: ExecutionContext;
}) {
  const resolvedValue = resolveValue({
    value: call.callee,
    context,
  });

  if (typeof resolvedValue !== "function") {
    throw new Error(
      `TypeError: ${
        call.callee.content[0].name || "anonymous"
      } is not a function`,
    );
  }

  const resolvedArgs = call.arguments.content.map((arg) =>
    resolveValue({ value: arg, context }),
  );

  return resolvedValue(...resolvedArgs);
}

function interpretAssignment({
  assignment,
  context,
}: {
  assignment: Assignment;
  context: ExecutionContext;
}) {
  const resolvedValue = resolveValue({
    value: assignment.value,
    context,
  });

  assignValueToIdentifier({
    assignee: assignment.assignee,
    resolvedValue,
    context,
  });
}

function interpretDefinition({
  definition,
  context,
}: {
  definition: Definition;
  context: ExecutionContext;
}) {
  const resolvedValue = resolveValue({
    value: definition.value,
    context,
  });

  if (context.scope.has(definition.assignee.name)) {
    throw new Error(
      `SyntaxError: Identifier '${definition.assignee.name}' has already been declared`,
    );
  }
  context.scope.set(definition.assignee.name, resolvedValue);
}

export function interpret({
  statements,
  context,
}: {
  statements: Statements;
  context: ExecutionContext;
}) {
  for (const statement of statements.content) {
    switch (statement.type) {
      case "Call":
        interpretCall({ call: statement, context });
        break;
      case "Assignment":
        interpretAssignment({ assignment: statement, context });
        break;
      case "Definition":
        interpretDefinition({ definition: statement, context });
        break;
      default:
        // This case should ideally not be reached if the AST is well-formed and all statement types are handled.
        throw new Error(
          // @ts-ignore - Ignoring TypeScript error for unreachable code path, as this indicates an unexpected AST node.
          `Unknown statement type encountered: ${statement.type}`,
        );
    }
  }
}
