import { AST } from "./interpreter";

export const programUtils = {
  generateString(parent: AST.StringParent, value: string = ""): AST.String {
    return {
      id: crypto.randomUUID(),
      parent,
      type: "String",
      value,
    };
  },
  generateNumber(parent: AST.NumberParent, value: number = 0): AST.Number {
    return {
      id: crypto.randomUUID(),
      parent,
      type: "Number",
      value,
    };
  },
  generateBoolean(
    parent: AST.BooleanParent,
    value: boolean = false,
  ): AST.Boolean {
    return {
      id: crypto.randomUUID(),
      parent,
      type: "Boolean",
      value,
    };
  },
  generateNull(parent: AST.NullParent): AST.Null {
    return {
      id: crypto.randomUUID(),
      parent,
      type: "Null",
      value: null,
    };
  },
  generateIdentifier(
    parent: AST.IdentifierParent,
    value: string = "x",
  ): AST.Identifier {
    return programUtils.generateString(parent, value);
  },
  generateIdentifiers(parent: AST.IdentifiersParent): AST.Identifiers {
    const identifiers: AST.Identifiers = {
      id: crypto.randomUUID(),
      parent,
      type: "Identifiers",
      contents: [],
    };
    identifiers.contents.push(programUtils.generateIdentifier(identifiers));

    return identifiers;
  },
  generateProperty(parent: AST.PropertyParent): AST.Property {
    const propertyBase: Omit<AST.Property, "key" | "expression"> = {
      id: crypto.randomUUID(),
      type: "Property",
      parent,
    };
    const property = propertyBase as AST.Property;
    property.key = programUtils.generateIdentifier(property);
    property.expression = programUtils.generateValue(property);

    return property;
  },
  generateProperties(parent: AST.PropertiesParent): AST.Properties {
    const properties: AST.Properties = {
      id: crypto.randomUUID(),
      parent,
      type: "Properties",
      contents: [],
    };
    properties.contents.push(programUtils.generateProperty(properties));

    return properties;
  },
  generateValue(parent: AST.BaseValueParent): AST.Value {
    return programUtils.generateNumber(parent);
  },
  generateValues(parent: AST.ValuesParent): AST.Values {
    const values: AST.Values = {
      id: crypto.randomUUID(),
      parent,
      type: "Values",
      contents: [],
    };
    values.contents.push(programUtils.generateValue(values));

    return values;
  },
  generateFunction(parent: AST.FunctionParent): AST.Function {
    const baseFn: Omit<AST.Function, "parameters" | "body" | "return"> = {
      id: crypto.randomUUID(),
      parent,
      type: "Function",
    };
    const fn = baseFn as AST.Function;
    fn.parameters = programUtils.generateIdentifiers(fn);
    fn.body = programUtils.generateStatements(fn);

    return fn;
  },
  generateCall(parent: AST.CallParent): AST.Call {
    const baseCall: Omit<AST.Call, "callee" | "arguments"> = {
      id: crypto.randomUUID(),
      type: "Call",
      parent,
    };
    const call = baseCall as AST.Call;
    call.callee = programUtils.generateIdentifiers(call);
    call.arguments = programUtils.generateValues(call);

    return call;
  },
  generateAssignment(parent: AST.AssignmentParent): AST.Assignment {
    const baseAssignment: Omit<AST.Assignment, "assignee" | "expression"> = {
      id: crypto.randomUUID(),
      type: "Assignment",
      parent,
    };
    const assignment = baseAssignment as AST.Assignment;
    assignment.assignee = programUtils.generateIdentifiers(assignment);
    assignment.expression = programUtils.generateValue(assignment);

    return assignment;
  },
  generateDefinition(parent: AST.DefinitionParent): AST.Definition {
    const baseDefinition: Omit<AST.Definition, "assignee" | "expression"> = {
      id: crypto.randomUUID(),
      type: "Definition",
      parent,
    };
    const definition = baseDefinition as AST.Definition;
    definition.assignee = programUtils.generateIdentifier(definition);
    definition.expression = programUtils.generateValue(definition);

    return definition;
  },
  generateStatement(parent: AST.BaseStatementParent): AST.Statement {
    return programUtils.generateCall(parent);
  },
  generateStatements(parent: AST.StatementsParent): AST.Statements {
    const statements: AST.Statements = {
      id: crypto.randomUUID(),
      parent,
      type: "Statements",
      contents: [],
    };
    statements.contents.push(programUtils.generateStatement(statements));

    return statements;
  },
  generateProgram(): AST.Program {
    const program: AST.Program = {
      id: crypto.randomUUID(),
      type: "Program",
      parent: null,
      body: [],
    };
    program.body.push(programUtils.generateStatements(program));

    return program;
  },
};
