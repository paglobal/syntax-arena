type CreateSyntaxShard<
  T extends string,
  P extends AST.SyntaxShard | null,
  O extends Record<string, unknown>,
> = {
  id: string;
  type: T;
  parent: P;
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

  export type Primitive = String | Number | Boolean | Null;

  export type Value =
    | Primitive
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
    { contents: Statements[] }
  >;
}

export function findScopeForIdentifier({
  identifier,
  context,
}: {
  identifier: AST.Identifier;
  context: ExecutionContext;
}) {
  let currentContext: ExecutionContext | undefined = context;
  while (currentContext) {
    if (currentContext.scope.has(identifier.value)) {
      return currentContext.scope;
    }
    currentContext = currentContext.parent;
  }

  return undefined;
}

export function resolveIdentifierValue({
  identifier,
  context,
}: {
  identifier: AST.Identifier;
  context: ExecutionContext;
}) {
  const scope = findScopeForIdentifier({ identifier, context });
  if (scope && scope.has(identifier.value)) {
    return scope.get(identifier.value);
  }

  throw new Error(`${identifier.value} is not defined`);
}

export function createExecutionContext(parentContext: ExecutionContext) {
  const newContext: ExecutionContext = {
    scope: new Map(),
    parent: parentContext,
  };

  return newContext;
}

export function* assignValueToIdentifier({
  assignment,
  resolvedValue,
  context,
}: {
  assignment: AST.Assignment;
  resolvedValue: unknown;
  context: ExecutionContext;
}): InterpreterGenerator {
  const identifiers = assignment.assignee.contents;
  if (identifiers.length === 1) {
    const identifierName = identifiers[0].value;
    const scope = findScopeForIdentifier({
      identifier: identifiers[0],
      context,
    });
    if (scope) {
      yield assignment;
      scope.set(identifierName, resolvedValue);
    } else {
      throw new Error(`${identifierName} is not defined`);
    }
  } else {
    let targetObject: unknown = undefined;
    let currentPropName: string | number | null | undefined;
    const baseIdentifier = identifiers[0];
    targetObject = resolveIdentifierValue({
      identifier: baseIdentifier,
      context,
    });
    // Check for null because null has a type of `object` (TODO: make utility function for this)
    if (!(typeof targetObject === "object" && targetObject !== null)) {
      throw new Error(
        `Cannot set properties of non-object '${baseIdentifier.value}'`,
      );
    }
    // Traverse the property chain to find the actual object to modify and the property name.
    for (let i = 1; i < identifiers.length; i++) {
      currentPropName = identifiers[i].value;
      if (i < identifiers.length - 1) {
        if (!(typeof targetObject === "object" && targetObject !== null)) {
          throw new Error(
            `Cannot access property '${currentPropName}' of non-object`,
          );
        }
        if (currentPropName === null || currentPropName === undefined) {
          throw new Error("Cannot index object with null or undefined");
        }
        if (!(currentPropName in targetObject)) {
          throw new Error(
            `Property ${currentPropName} doesn't exist on object`,
          );
        }
        targetObject = (targetObject as Record<string, unknown>)[
          currentPropName
        ];
      }
    }
    if (!(typeof targetObject === "object" && targetObject !== null)) {
      throw new Error(
        `Cannot assign to property '${currentPropName}' of non-object`,
      );
    }
    if (currentPropName === undefined || currentPropName === null) {
      throw new Error("Cannot index object with null or undefined");
    }
    yield assignment;
    (targetObject as Record<string, unknown>)[currentPropName] = resolvedValue;
  }
}

export function* resolveValue({
  value,
  context,
}: {
  value: AST.Value;
  context: ExecutionContext;
}): InterpreterGenerator<unknown> {
  yield value;
  switch (value.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null": {
      return value.value;
    }
    case "Identifiers": {
      let resolvedIdentifierValue: unknown = undefined;
      const identifiers = value.contents;
      // we should ideally never encounter this because of the nature of the UI
      if (identifiers.length === 0) {
        throw new Error("Empty identifier list encountered.");
      }
      resolvedIdentifierValue = resolveIdentifierValue({
        identifier: identifiers[0],
        context,
      });
      for (let i = 1; i < identifiers.length; i++) {
        const propName = identifiers[i].value;
        if (propName === null) {
          throw new Error("Null is an invalid identifier");
        }
        // check for null because it also passes off as an object when using typeof
        if (
          typeof resolvedIdentifierValue === "object" &&
          resolvedIdentifierValue !== null
        ) {
          resolvedIdentifierValue = (
            resolvedIdentifierValue as Record<string, unknown>
          )[propName];
        } else {
          throw new Error(`Cannot access property '${propName}' of non-object`);
        }
      }

      return resolvedIdentifierValue;
    }
    case "Call": {
      return yield* interpretCall({ call: value, context });
    }
    case "Properties": {
      const obj: Record<string, unknown> = {};
      for (const prop of value.contents) {
        if (prop.key.value === null) {
          throw new Error("Null is an invalid identifier");
        }
        obj[prop.key.value] = yield* resolveValue({
          value: prop.expression,
          context,
        });
      }

      return obj;
    }
    case "Values": {
      const arr: unknown[] = [];
      for (const element of value.contents) {
        arr.push(yield* resolveValue({ value: element, context }));
      }

      return arr;
    }
    case "Function": {
      function* fn(...args: any[]): InterpreterGenerator<unknown> {
        yield value;
        const functionShard = value as AST.Function;
        const newContext = createExecutionContext(context);

        yield functionShard.parameters;
        functionShard.parameters.contents.forEach((param, index) => {
          if (param.value === null) {
            throw new Error("Null is an invalid identifier");
          }
          newContext.scope.set(param.value, args[index]);
        });

        yield functionShard.body;
        yield* interpret({
          statements: functionShard.body,
          context: newContext,
        });

        // TODO: reimplement logic here
        // yield functionShard.return;
        // return yield* resolveValue({
        //   value: functionShard.return,
        //   context: newContext,
        // });
        //
        return 5;
      }

      return fn;
    }
    default: {
      // @ts-expect-error - This case should ideally not be reachable with a well-defined AST and complete handling.
      throw new Error(`Unknown value type encountered: ${value.type}`);
    }
  }
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
      case "Identifiers": {
        throw new Error(
          `${call.callee.contents[0].value || "anonymous"} is not a function`,
        );
      }
      default: {
        throw new Error(`Invalid code construction`);
      }
    }
  }

  yield call.arguments;
  const resolvedArguments = [];
  for (const argument of call.arguments.contents) {
    resolvedArguments.push(yield* resolveValue({ value: argument, context }));
  }

  yield call;
  const result = resolvedValue(...resolvedArguments);
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
      case "Call": {
        yield* interpretCall({ call: statement, context });

        break;
      }
      case "Assignment": {
        yield* interpretAssignment({ assignment: statement, context });

        break;
      }
      case "Definition": {
        yield* interpretDefinition({ definition: statement, context });

        break;
      }
      default: {
        // This case should ideally not be reached if the AST is well-formed and all statement types are handled.
        throw new Error(
          // @ts-expect-error - Ignoring TypeScript error for unreachable code path, as this indicates an unexpected AST node.
          `Unknown statement type encountered: ${statement.type}`,
        );
      }
    }
  }
}
