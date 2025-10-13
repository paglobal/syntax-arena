import { assignValueToIdentifier, resolveValue } from "./interpreterUtils.ts";
import { assertNever } from "@/utils";

export type Display = "inline-block" | "block";

type CreateSyntaxShard<
  T extends string,
  P extends AST.SyntaxShard | null,
  O extends Record<string, unknown>,
> = {
  id: string;
  type: T;
  parent: P;
  display: Display;
} & O;

export type Scope = Map<string | number | null, unknown>;

export type ExecutionContext = { parent?: ExecutionContext; scope: Scope };

export type InterpreterGenerator<T = void> = Generator<
  AST.SyntaxShard,
  T,
  unknown
>;

export namespace AST {
  export type BaseValueParent =
    | Assignment
    | Definition
    | Function
    | Property
    | Values;

  export type StringParent = BaseValueParent | IdentifierParent;

  export interface String
    extends CreateSyntaxShard<"String", StringParent, { value: string }> {}

  export type NumberParent = BaseValueParent | IdentifierParent;

  export interface Number
    extends CreateSyntaxShard<"Number", NumberParent, { value: number }> {}

  export type BooleanParent = BaseValueParent;

  export interface Boolean
    extends CreateSyntaxShard<"Boolean", BooleanParent, { value: boolean }> {}

  export type NullParent = BaseValueParent | IdentifierParent;

  export interface Null
    extends CreateSyntaxShard<"Null", NullParent, { value: null }> {}

  export type IdentifiersParent = BaseValueParent | Call;

  export interface Identifiers
    extends CreateSyntaxShard<
      "Identifiers",
      IdentifiersParent,
      { contents: Identifier[] }
    > {}

  export type IdentifierParent = Identifiers | Definition | Property;

  export type Identifier = String | Number | Null;

  export type PropertyParent = Properties;

  export interface Property
    extends CreateSyntaxShard<
      "Property",
      PropertyParent,
      { key: Identifier; expression: Value }
    > {}

  export type PropertiesParent = BaseValueParent;

  export interface Properties
    extends CreateSyntaxShard<
      "Properties",
      PropertiesParent,
      { contents: Property[] }
    > {}

  export type ValuesParent = BaseValueParent | Call;

  export interface Values
    extends CreateSyntaxShard<"Values", ValuesParent, { contents: Value[] }> {}

  export type BaseStatementParent = Statements;

  export type CallParent = BaseValueParent | BaseStatementParent;

  export interface Call
    extends CreateSyntaxShard<
      "Call",
      CallParent,
      {
        callee: Identifiers | Function;
        arguments: Values;
      }
    > {}

  export type AssignmentParent = BaseStatementParent;

  export interface Assignment
    extends CreateSyntaxShard<
      "Assignment",
      AssignmentParent,
      {
        assignee: Identifiers;
        expression: Value;
      }
    > {}

  export type DefinitionParent = BaseStatementParent;

  export interface Definition
    extends CreateSyntaxShard<
      "Definition",
      DefinitionParent,
      {
        assignee: Identifier;
        expression: Value;
      }
    > {}

  export type Statement = Definition | Assignment | Call;

  export type StatementsParent = Program | Function;

  export type Statements = CreateSyntaxShard<
    "Statements",
    StatementsParent,
    { contents: Statement[] }
  >;

  export type FunctionParent = BaseValueParent | Call;

  export interface Function
    extends CreateSyntaxShard<
      "Function",
      FunctionParent,
      {
        parameters: Identifiers;
        body: Statements;
      }
    > {}

  export type Value =
    | String
    | Number
    | Boolean
    | Null
    | Identifiers
    | Call
    | Properties
    | Values
    | Function;

  export type SyntaxShard =
    | Statement
    | Value
    | Identifier
    | Property
    | Statements
    | Program;

  export type ShardGroup = Identifiers | Properties | Statements | Statements;

  export type Program = CreateSyntaxShard<
    "Program",
    null,
    { body: Statements[] }
  >;
}

export function* interpretCall({
  call,
  context,
}: {
  call: AST.Call;
  context: ExecutionContext;
}): InterpreterGenerator<unknown> {
  yield call.callee;
  const resolvedValue = yield* resolveValue({
    value: call.callee,
    context,
  });

  if (typeof resolvedValue !== "function") {
    switch (call.callee.type) {
      case "Identifiers":
        throw new Error(
          `${call.callee.contents[0].value || "anonymous"} is not a function`,
        );
      // this shouldn't even be possible with the UI
      case "Function":
        throw new Error(`"anonymous" is not a function`);
      default:
        assertNever(call.callee);
    }
  }

  yield call.arguments;
  const resolvedArgs = [];
  for (const arg of call.arguments.contents) {
    resolvedArgs.push(yield* resolveValue({ value: arg, context }));
  }

  yield call;
  const result = resolvedValue(...resolvedArgs);
  if (result && typeof (result as any)[Symbol.iterator] === "function") {
    return yield* result as any;
  } else {
    return result;
  }
}

function* interpretAssignment({
  assignment,
  context,
}: {
  assignment: AST.Assignment;
  context: ExecutionContext;
}): InterpreterGenerator {
  yield assignment.expression;
  const resolvedValue = yield* resolveValue({
    value: assignment.expression,
    context,
  });

  yield assignment.assignee;
  yield* assignValueToIdentifier({
    assignment: assignment,
    resolvedValue,
    context,
  });
}

function* interpretDefinition({
  definition,
  context,
}: {
  definition: AST.Definition;
  context: ExecutionContext;
}): InterpreterGenerator {
  yield definition.expression;
  const resolvedValue = yield* resolveValue({
    value: definition.expression,
    context,
  });

  yield definition.assignee;
  if (context.scope.has(definition.assignee.value)) {
    throw new Error(
      `Identifier '${definition.assignee.value}' has already been declared`,
    );
  }

  yield definition;
  context.scope.set(definition.assignee.value, resolvedValue);
}

export function* interpret({
  statements,
  context,
}: {
  statements: AST.Statements;
  context: ExecutionContext;
}): InterpreterGenerator {
  for (const statement of statements.contents) {
    switch (statement.type) {
      case "Call":
        yield* interpretCall({ call: statement, context });

        break;
      case "Assignment":
        yield* interpretAssignment({ assignment: statement, context });

        break;
      case "Definition":
        yield* interpretDefinition({ definition: statement, context });

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
