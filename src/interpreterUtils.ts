import {
  ExecutionContext,
  Fn,
  Identifier,
  Identifiers,
  interpret,
  interpretCall,
  Value,
} from "./interpreter";

export function findScopeForIdentifier({
  identifier,
  context,
}: {
  identifier: Identifier;
  context: ExecutionContext;
}) {
  let currentContext: ExecutionContext | undefined = context;
  while (currentContext) {
    if (currentContext.scope.has(identifier.name)) {
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
  identifier: Identifier;
  context: ExecutionContext;
}): unknown {
  const scope = findScopeForIdentifier({ identifier, context });
  if (scope) {
    return scope.get(identifier.name);
  }
  throw new Error(`ReferenceError: ${identifier.name} is not defined`);
}

export function createExecutionContext(parentContext: ExecutionContext) {
  const newContext: ExecutionContext = {
    scope: new Map(),
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
  const identifiers = assignee.contents;

  if (identifiers.length === 1) {
    const identifierName = identifiers[0].name;
    const scope = findScopeForIdentifier({
      identifier: identifiers[0],
      context,
    });

    if (scope) {
      scope.set(identifierName, resolvedValue);
    } else {
      throw new Error(`ReferenceError: ${identifierName} is not defined`);
    }
  } else {
    let targetObject: unknown = undefined;
    let propertyToAssign: string | undefined;

    const baseIdentifier = identifiers[0];
    targetObject = resolveIdentifierValue({
      identifier: baseIdentifier,
      context,
    });

    if (typeof targetObject !== "object" || targetObject === null) {
      throw new Error(
        `TypeError: Cannot set properties of non-object (or null) '${baseIdentifier.name}'`,
      );
    }

    // Traverse the property chain to find the actual object to modify and the property name.
    for (let i = 1; i < identifiers.length; i++) {
      const currentIdentifier = identifiers[i];
      propertyToAssign = currentIdentifier.name;

      if (i < identifiers.length - 1) {
        if (!(propertyToAssign in (targetObject as Record<string, unknown>))) {
          throw new Error(
            `TypeError: Cannot access property '${propertyToAssign}' of undefined or null object`,
          );
        }
        targetObject = (targetObject as Record<string, unknown>)[
          propertyToAssign
        ];
      }
    }

    if (propertyToAssign) {
      (targetObject as Record<string, unknown>)[propertyToAssign] =
        resolvedValue;
    } else {
      // This error should ideally be caught by the intermediate checks, but serves as a fallback.
      throw new Error(
        `TypeError: Cannot assign to property '${propertyToAssign}' of non-object or null`,
      );
    }
  }
}

export function resolveValue({
  value,
  context,
}: {
  value: Value;
  context: ExecutionContext;
}): unknown {
  switch (value.type) {
    case "String":
    case "Number":
    case "Boolean":
    case "Null":
      return value.value;
    case "Identifiers":
      let resolved: unknown = undefined;
      const identifiers = value.contents;

      if (identifiers.length === 0) {
        throw new Error("SyntaxError: Empty identifier list encountered.");
      }

      resolved = resolveIdentifierValue({
        identifier: identifiers[0],
        context,
      });

      for (let i = 1; i < identifiers.length; i++) {
        const propName = identifiers[i].name;
        // check for null because it also passes off as an object when using typeof
        if (typeof resolved === "object" && resolved !== null) {
          resolved = (resolved as Record<string, unknown>)[propName];
        } else {
          throw new Error(
            `TypeError: Cannot read properties of undefined or null (reading '${propName}')`,
          );
        }
      }

      return resolved;
    case "Call":
      return interpretCall({ call: value, context });
    case "Properties":
      const obj: Record<string, unknown> = {};
      for (const prop of value.contents) {
        obj[prop.key.name] = resolveValue({ value: prop.expression, context });
      }

      return obj;
    case "Values":
      const arr: unknown[] = [];
      for (const element of value.contents) {
        arr.push(resolveValue({ value: element, context }));
      }

      return arr;
    case "Function":
      function fn(...args: any[]) {
        const fnValue = value as Fn;
        const newContext = createExecutionContext(context);

        fnValue.parameters.contents.forEach((param, index) => {
          newContext.scope.set(param.name, args[index]);
        });
        interpret({ statements: fnValue.body, context: newContext });

        return resolveValue({ value: fnValue.return, context: newContext });
      }

      return fn;
    default:
      // @ts-ignore - This case should ideally not be reachable with a well-defined AST and complete handling.
      throw new Error(`Unknown value type encountered: ${value.type}`);
  }
}
