type Str = { type: "String"; value: string };

type Num = { type: "Number"; value: number };

type Bool = { type: "Boolean"; value: boolean };

type Identifier = { type: "Identifier"; name: string };

type Identifiers = Identifier[];

type Property = { type: "Property"; key: Identifier; value: Value };

type Obj = { type: "Object"; id: string; properties: Property[] };

type Arr = { type: "Array"; id: string; elements: Value[] };

type FunctionDefinition = {
  type: "FunctionDefinition";
  id: string;
  parameters: Identifier[];
  body: (FunctionCall | Assignment)[];
  return: Value;
};

type FunctionCall = {
  type: "FunctionCall";
  callee: Identifier[];
  arguments: Value[];
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

type Assignment = {
  type: "assignment";
  assignee: Identifiers;
  value: Value;
};

type AST = { id: string; body: (FunctionCall | Assignment)[] }[];
