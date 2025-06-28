import { assignValueToIdentifier, resolveValue } from "./interpreterUtils";

type ObjectOrArray = { [key: string]: unknown };

type SyntaxShard<T extends string, U extends ObjectOrArray> = {
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

type Function = {
  type: "Function";
  parameters: Identifiers;
  body: Statements;
  return: Value;
};

export type Value =
  | Str
  | Num
  | Bool
  | Identifiers
  | Call
  | Obj
  | Arr
  | Function;

type Values = SyntaxShard<"Values", { content: Value[] }>;

type AST = Statements[];

export type Scope = Map<string, unknown>;

export type ExecutionContext = { parent?: ExecutionContext; scope: Scope };

function interpretCall({
  call,
  context,
}: {
  call: Call;
  context: ExecutionContext;
}) {
  call;
  context;
}

function interpretAssignment({
  assignment,
  context,
}: {
  assignment: Assignment;
  context: ExecutionContext;
}) {
  const resolvedValue = resolveValue({ value: assignment.value, context });
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
  definition;
  context;
}

function interpret({
  statements,
  context,
}: {
  statements: Statements;
  context: ExecutionContext;
}) {
  for (const statement of statements.content) {
    if (statement.type === "Call") {
      interpretCall({
        call: statement,
        context: context,
      });
    } else if (statement.type === "Assignment") {
      interpretAssignment({ assignment: statement, context: context });
    } else if (statement.type === "Definition") {
      interpretDefinition({ definition: statement, context: context });
    } else {
      // @error
    }
  }
}
