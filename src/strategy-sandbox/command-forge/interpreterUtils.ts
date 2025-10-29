import {
  ExecutionContext,
  AST,
  interpret,
  interpretCall,
  InterpreterGenerator,
} from "./interpreter";

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
    case "Null":
      return value.value;
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
    default:
      // @ts-expect-error - This case should ideally not be reachable with a well-defined AST and complete handling.
      throw new Error(`Unknown value type encountered: ${value.type}`);
  }
}
