import { AST } from "./interpreter";

export function generateString(
  parent: AST.StringParent,
  value: string = "",
): AST.String {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "String",
    value,
  };
}

export function generateNumber(
  parent: AST.NumberParent,
  value: number = 0,
): AST.Number {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Number",
    value,
  };
}

export function generateBoolean(
  parent: AST.BooleanParent,
  value: boolean = false,
): AST.Boolean {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Boolean",
    value,
  };
}

export function generateNull(parent: AST.NullParent): AST.Null {
  return {
    id: crypto.randomUUID(),
    parent,
    type: "Null",
    value: null,
  };
}

export function generateIdentifier(
  parent: AST.IdentifierParent,
  value: string = "x",
): AST.Identifier {
  return generateString(parent, value);
}

export function generateIdentifiers(
  parent: AST.IdentifiersParent,
): AST.Identifiers {
  const identifiers: AST.Identifiers = {
    id: crypto.randomUUID(),
    parent,
    type: "Identifiers",
    contents: [],
  };
  identifiers.contents.push(generateIdentifier(identifiers));

  return identifiers;
}
export function generateProperty(parent: AST.PropertyParent): AST.Property {
  const propertyBase: Omit<AST.Property, "key" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Property",
    parent,
  };
  const property = propertyBase as AST.Property;
  property.key = generateIdentifier(property);
  property.expression = generateValue(property);

  return property;
}

export function generateProperties(
  parent: AST.PropertiesParent,
): AST.Properties {
  const properties: AST.Properties = {
    id: crypto.randomUUID(),
    parent,
    type: "Properties",
    contents: [],
  };
  properties.contents.push(generateProperty(properties));

  return properties;
}

export function generateValue(parent: AST.BaseValueParent): AST.Value {
  return generateNumber(parent);
}

export function generateValues(parent: AST.ValuesParent): AST.Values {
  const values: AST.Values = {
    id: crypto.randomUUID(),
    parent,
    type: "Values",
    contents: [],
  };
  values.contents.push(generateValue(values));

  return values;
}

export function generateFunction(parent: AST.FunctionParent): AST.Function {
  const baseFn: Omit<AST.Function, "parameters" | "body" | "return"> = {
    id: crypto.randomUUID(),
    parent,
    type: "Function",
  };
  const fn = baseFn as AST.Function;
  fn.parameters = generateIdentifiers(fn);
  fn.body = generateStatements(fn);

  return fn;
}

export function generateCall(parent: AST.CallParent): AST.Call {
  const baseCall: Omit<AST.Call, "callee" | "arguments"> = {
    id: crypto.randomUUID(),
    type: "Call",
    parent,
  };
  const call = baseCall as AST.Call;
  call.callee = generateIdentifiers(call);
  call.arguments = generateValues(call);

  return call;
}

export function generateAssignment(
  parent: AST.AssignmentParent,
): AST.Assignment {
  const baseAssignment: Omit<AST.Assignment, "assignee" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Assignment",
    parent,
  };
  const assignment = baseAssignment as AST.Assignment;
  assignment.assignee = generateIdentifiers(assignment);
  assignment.expression = generateValue(assignment);

  return assignment;
}

export function generateDefinition(
  parent: AST.DefinitionParent,
): AST.Definition {
  const baseDefinition: Omit<AST.Definition, "assignee" | "expression"> = {
    id: crypto.randomUUID(),
    type: "Definition",
    parent,
  };
  const definition = baseDefinition as AST.Definition;
  definition.assignee = generateIdentifier(definition);
  definition.expression = generateValue(definition);

  return definition;
}
export function generateStatement(
  parent: AST.BaseStatementParent,
): AST.Statement {
  return generateCall(parent);
}

export function generateStatements(
  parent: AST.StatementsParent,
): AST.Statements {
  const statements: AST.Statements = {
    id: crypto.randomUUID(),
    parent,
    type: "Statements",
    contents: [],
  };
  statements.contents.push(generateStatement(statements));

  return statements;
}

export function generateProgram(): AST.Program {
  const baseProgram: Omit<AST.Program, "body"> = {
    id: crypto.randomUUID(),
    type: "Program",
    parent: null,
  };
  const program = baseProgram as AST.Program;
  program.body = generateStatements(program);

  return program;
}
