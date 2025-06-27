type Str = { type: "String"; value: string };

type Num = { type: "Number"; value: number };

type Bool = { type: "Boolean"; value: boolean };

type Identifier = { type: "Identifier"; name: string };

type Identifiers = Identifier[];

type Property = { type: "Property"; key: Identifier; value: Value };

type Obj = { type: "Object"; properties: Property[] };

type Arr = { type: "Array"; elements: Value[] };

type FunctionCall = {
  type: "FunctionCall";
  callee: Identifiers;
  arguments: Value[];
};

type Assignment = {
  type: "Assignment";
  assignee: Identifiers;
  value: Value;
};

type Statement = FunctionCall | Assignment;

type CommandBlock = Statement[];

type FunctionDefinition = {
  type: "FunctionDefinition";
  parameters: Identifiers;
  commandBlock: CommandBlock;
  return: Value;
};

type Value =
  | Str
  | Num
  | Bool
  | Identifiers
  | FunctionCall
  | Obj
  | Arr
  | FunctionDefinition;

type AST = CommandBlock[];

function interpretFunctionCall(functionCall: FunctionCall) {}

function interpretAssignment(assignment: Assignment) {}

function interpret(commandBlock: CommandBlock) {
  for (const statement of commandBlock) {
    if (statement.type === "FunctionCall") {
      interpretFunctionCall(statement);
    } else if (statement.type === "Assignment") {
      interpretAssignment(statement);
    } else {
      // error
    }
  }
}
