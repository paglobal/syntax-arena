import { assertNever } from "@/utils";

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

type ExecutionContext = { parent?: ExecutionContext; scope: Scope };

type InterpreterGenerator<T = void> = Generator<AST.SyntaxShard, T, unknown>;

export namespace AST {
  export type BaseValueParent =
    | Assignment
    | Definition
    | Function
    | Property
    | Values;

  export type StringParent = BaseValueParent | IdentifierParent;

  export interface String extends CreateSyntaxShard<
    "String",
    StringParent,
    { value: string }
  > {}

  export type NumberParent = BaseValueParent | IdentifierParent;

  export interface Number extends CreateSyntaxShard<
    "Number",
    NumberParent,
    { value: number }
  > {}

  export type BooleanParent = BaseValueParent;

  export interface Boolean extends CreateSyntaxShard<
    "Boolean",
    BooleanParent,
    { value: boolean }
  > {}

  export type NullParent = BaseValueParent | IdentifierParent;

  export interface Null extends CreateSyntaxShard<
    "Null",
    NullParent,
    { value: null }
  > {}

  export type IdentifiersParent = BaseValueParent | Call;

  export interface Identifiers extends CreateSyntaxShard<
    "Identifiers",
    IdentifiersParent,
    { contents: Identifier[] }
  > {}

  export type IdentifierParent = Identifiers | Definition | Property;

  export type Identifier = String | Number | Null;

  export type PropertyParent = Properties;

  export interface Property extends CreateSyntaxShard<
    "Property",
    PropertyParent,
    { key: Identifier; expression: Value }
  > {}

  export type PropertiesParent = BaseValueParent;

  export interface Properties extends CreateSyntaxShard<
    "Properties",
    PropertiesParent,
    { contents: Property[] }
  > {}

  export type ValuesParent = BaseValueParent | Call;

  export interface Values extends CreateSyntaxShard<
    "Values",
    ValuesParent,
    { contents: Value[] }
  > {}

  export type BaseStatementParent = Statements;

  export type CallParent = BaseValueParent | BaseStatementParent;

  export interface Call extends CreateSyntaxShard<
    "Call",
    CallParent,
    {
      callee: Identifiers | Function;
      arguments: Identifiers | Values;
    }
  > {}

  export type AssignmentParent = BaseStatementParent;

  export interface Assignment extends CreateSyntaxShard<
    "Assignment",
    AssignmentParent,
    {
      assignee: Identifiers;
      expression: Value;
    }
  > {}

  export type DefinitionParent = BaseStatementParent;

  export interface Definition extends CreateSyntaxShard<
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

  export interface Function extends CreateSyntaxShard<
    "Function",
    FunctionParent,
    {
      parameters: Identifiers;
      body: Statements;
    }
  > {}

  export type PrimitiveShard = String | Number | Boolean | Null;

  export type CompositeShard = Exclude<AST.SyntaxShard, PrimitiveShard>;

  export type Value =
    | PrimitiveShard
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

  export type ShardGroup =
    | Identifiers
    | Properties
    | Values
    | Statements
    | Statements;

  export type Program = CreateSyntaxShard<
    "Program",
    null,
    { body: Statements }
  >;
}

const SHOULD_NOT_HAPPEN_NOTE = "(this shouldn't happen, please report!)";

const errorMessages = {
  undefinedVar: (variableName: AST.Identifier["value"]) =>
    `Variable ${variableName} is not defined`,
  alreadyDeclaredVar: (variableName: AST.Identifier["value"]) =>
    `Variable '${variableName}' has already been declared`,
  nonObjectPropertyAssignment: ({
    objectPath,
    propertyName,
  }: {
    objectPath: string;
    propertyName?: AST.Identifier["value"];
  }) =>
    `Cannot set ${propertyName === undefined ? "properties" : propertyName} of non-object '${objectPath}'`,
  nonObjectPropertyAccess: ({
    propertyName,
    objectPath,
  }: {
    propertyName: AST.Identifier["value"];
    objectPath: string;
  }) =>
    `Cannot access property "${propertyName}' of non-object '${objectPath}'`,
  nullOrUndefinedObjectIndex: (objectPath?: string) =>
    `Cannot index object ${objectPath === undefined ? "" : objectPath} with null or undefined`,
  nonExistentObjectProperty: ({
    propertyName,
    objectPath,
  }: {
    propertyName: AST.Identifier["value"];
    objectPath: string;
  }) => `Property ${propertyName} doesn't exist on object ${objectPath}`,
  emptyIdenfierList: () =>
    `Empty identifier list encountered ${SHOULD_NOT_HAPPEN_NOTE}`,
  nonFunction: (functionName: AST.Identifier["value"]) =>
    `${functionName} is not a function`,
  unexpectedCodeConstruction: () =>
    `Unexpected code construction ${SHOULD_NOT_HAPPEN_NOTE}`,
};

function findScopeForIdentifier({
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

function resolveIdentifierValue({
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

  throw new Error(errorMessages.undefinedVar(identifier.value));
}

function createExecutionContext(parentContext: ExecutionContext) {
  const newContext: ExecutionContext = {
    scope: new Map(),
    parent: parentContext,
  };

  return newContext;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function* assignValueToIdentifier({
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
    const identifier = identifiers[0];
    const scope = findScopeForIdentifier({
      identifier: identifier,
      context,
    });
    if (scope) {
      yield assignment;
      scope.set(identifier.value, resolvedValue);
    } else {
      throw new Error(errorMessages.undefinedVar(identifier.value));
    }
  } else {
    let targetObject: unknown = undefined;
    let currentPropertyName: AST.Identifier["value"] | undefined;
    const baseIdentifier = identifiers[0];
    targetObject = resolveIdentifierValue({
      identifier: baseIdentifier,
      context,
    });
    if (!isObject(targetObject)) {
      throw new Error(
        errorMessages.nonObjectPropertyAssignment({
          objectPath: String(baseIdentifier.value),
        }),
      );
    }
    for (let i = 1; i < identifiers.length; i++) {
      currentPropertyName = identifiers[i].value;
      const objectPath = identifiers
        .slice(0, i)
        .map((id) => id.value)
        .join(".");
      if (i < identifiers.length - 1) {
        if (!isObject(targetObject)) {
          throw new Error(
            errorMessages.nonObjectPropertyAccess({
              propertyName: currentPropertyName,
              objectPath,
            }),
          );
        }
        if (currentPropertyName === null) {
          throw new Error(errorMessages.nullOrUndefinedObjectIndex(objectPath));
        }
        if (!(currentPropertyName in targetObject)) {
          throw new Error(
            errorMessages.nonExistentObjectProperty({
              propertyName: currentPropertyName,
              objectPath,
            }),
          );
        }
        targetObject = (targetObject as Record<string, unknown>)[
          currentPropertyName
        ];
      }
    }
    const objectPath = identifiers.map((id) => id.value).join(".");
    if (!isObject(targetObject)) {
      throw new Error(
        errorMessages.nonObjectPropertyAssignment({
          objectPath,
          propertyName: currentPropertyName,
        }),
      );
    }
    if (currentPropertyName === undefined || currentPropertyName === null) {
      throw new Error(errorMessages.nullOrUndefinedObjectIndex(objectPath));
    }
    yield assignment;
    (targetObject as Record<string, unknown>)[currentPropertyName] =
      resolvedValue;
  }
}

class ReturnValue {
  constructor(public value: unknown) {}
}

export function ret(value: unknown) {
  throw new ReturnValue(value);
}

function* resolveValue({
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
      // This should ideally be impossible because of the nature of the forge controller
      if (identifiers.length === 0) {
        throw new Error(errorMessages.emptyIdenfierList());
      }
      resolvedIdentifierValue = resolveIdentifierValue({
        identifier: identifiers[0],
        context,
      });
      for (let i = 1; i < identifiers.length; i++) {
        const currentPropertyName = identifiers[i].value;
        const objectPath = identifiers
          .slice(0, i)
          .map((id) => id.value)
          .join(".");
        if (!isObject(resolvedIdentifierValue)) {
          throw new Error(
            errorMessages.nonObjectPropertyAccess({
              propertyName: currentPropertyName,
              objectPath,
            }),
          );
        }
        if (currentPropertyName === null) {
          throw new Error(errorMessages.nullOrUndefinedObjectIndex(objectPath));
        }
        if (!(currentPropertyName in resolvedIdentifierValue)) {
          throw new Error(
            errorMessages.nonExistentObjectProperty({
              propertyName: currentPropertyName,
              objectPath,
            }),
          );
        }
        resolvedIdentifierValue = (
          resolvedIdentifierValue as Record<string, unknown>
        )[currentPropertyName];
      }

      return resolvedIdentifierValue;
    }
    case "Call": {
      return yield* interpretCall({ call: value, context });
    }
    case "Properties": {
      const obj: Record<string, unknown> = {};
      for (const property of value.contents) {
        if (property.key.value === null) {
          throw new Error(errorMessages.nullOrUndefinedObjectIndex());
        }
        obj[property.key.value] = yield* resolveValue({
          value: property.expression,
          context,
        });
      }

      return obj;
    }
    case "Values": {
      const array: unknown[] = [];
      for (const element of value.contents) {
        array.push(yield* resolveValue({ value: element, context }));
      }

      return array;
    }
    case "Function": {
      function* fn(...args: any[]): InterpreterGenerator<unknown> {
        yield value;
        const functionShard = value as AST.Function;
        const newContext = createExecutionContext(context);
        yield functionShard.parameters;
        functionShard.parameters.contents.forEach((parameter, index) => {
          newContext.scope.set(parameter.value, args[index]);
        });
        yield functionShard.body;
        try {
          yield* interpret({
            statements: functionShard.body,
            context: newContext,
          });

          return undefined;
        } catch (error) {
          if (error instanceof ReturnValue) {
            return error.value;
          }
          throw error;
        }
      }

      return fn;
    }
    default: {
      assertNever(value, errorMessages.unexpectedCodeConstruction());
    }
  }
}

function* interpretCall({
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
        const functionName = call.callee.contents.join(".");
        throw new Error(errorMessages.nonFunction(functionName));
      }
      case "Function": {
        throw new Error(errorMessages.unexpectedCodeConstruction());
      }
      default: {
        assertNever(call.callee, errorMessages.unexpectedCodeConstruction());
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
    return yield* result;
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
    assignment,
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
      errorMessages.alreadyDeclaredVar(definition.assignee.value),
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
        assertNever(statement, errorMessages.unexpectedCodeConstruction());
      }
    }
  }
}
