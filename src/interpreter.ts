import { assignValueToIdentifier, resolveValue } from "./interpreterUtils";

export type CreateSyntaxShard<
  T extends string,
  U extends Record<string, unknown>,
> = {
  id: string;
  type: T;
} & U;

export type Str = CreateSyntaxShard<"String", { value: string }>;

export type Num = CreateSyntaxShard<"Number", { value: number }>;

export type Bool = CreateSyntaxShard<"Boolean", { value: boolean }>;

export type Null = CreateSyntaxShard<"Null", { value: null }>;

export type Identifier = CreateSyntaxShard<"Identifier", { name: string }>;

export type Identifiers = CreateSyntaxShard<
  "Identifiers",
  { contents: Identifier[] }
>;

export type Property = CreateSyntaxShard<
  "Property",
  { key: Identifier; expression: Value }
>;

export type Properties = CreateSyntaxShard<
  "Properties",
  { contents: Property[] }
>;

export type Values = CreateSyntaxShard<"Values", { contents: Value[] }>;

export type Call = CreateSyntaxShard<
  "Call",
  {
    callee: Identifiers | Fn;
    arguments: Values;
  }
>;

export type Assignment = CreateSyntaxShard<
  "Assignment",
  {
    assignee: Identifiers;
    expression: Value;
  }
>;

export type Definition = CreateSyntaxShard<
  "Definition",
  {
    assignee: Identifier;
    expression: Value;
  }
>;

export type Statement = Definition | Assignment | Call;

export type Statements = CreateSyntaxShard<
  "Statements",
  { contents: Statement[] }
>;

export type Fn = CreateSyntaxShard<
  "Function",
  {
    parameters: Identifiers;
    body: Statements;
    return: Value;
  }
>;

export type Value =
  | Str
  | Num
  | Bool
  | Null
  | Identifiers
  | Call
  | Properties
  | Values
  | Fn;

export type SyntaxShard =
  | Statement
  | Value
  | Identifier
  | Property
  | Statements;

export type Program = Statements[];

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
    switch (call.callee.type) {
      case "Identifiers":
        throw new Error(
          `TypeError: ${
            call.callee.contents[0].name || "anonymous"
          } is not a function`,
        );
      case "Function":
        throw new Error(`TypeError: "anonymous" is not a function`);
    }
  }

  const resolvedArgs = call.arguments.contents.map((arg) =>
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
    value: assignment.expression,
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
    value: definition.expression,
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
  for (const statement of statements.contents) {
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
