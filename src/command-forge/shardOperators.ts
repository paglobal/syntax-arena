import { assertNever } from "@/utils";
import { AST } from "./interpreter";

const tupleFromUnionType =
  <T>() =>
  <U extends T[]>(
    ...array: U & ([T] extends [U[number]] ? unknown : "Missing union members")
  ) =>
    array;

const getTypedShardFieldPair = <T extends AST.SyntaxShard>(
  shard: T,
  field: string | number | symbol,
) => {
  const typedShard = shard;
  const typedField = field as Exclude<
    keyof typeof typedShard,
    "type" | "id" | "parent"
  >;

  return [typedShard, typedField] as const;
};

type RelevantFields<T extends AST.SyntaxShard> = Exclude<
  keyof T,
  "id" | "parent" | "type"
>;

type ContentsType<
  T extends AST.ShardGroup,
  U extends "contents",
> = T[U][number]["type"];

type OtherRelevantFieldsType<
  T extends AST.CompositeShard,
  U extends RelevantFields<T>,
> = T[U] extends AST.SyntaxShard ? T[U]["type"] : never;

export function getShardRoleDetails<T extends AST.SyntaxShard>(
  shard: T,
): { role: RelevantFields<T> | null; roleName: string | null } {
  if (shard.parent === null) {
    return { role: null, roleName: null };
  }
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);
  switch (shard.parent.type) {
    case "Program":
    case "Definition":
    case "Function":
    case "Property":
    case "Assignment":
    case "Call": {
      for (const [key, value] of Object.entries(shard.parent)) {
        const excludedKeys = tupleFromUnionType<keyof AST.SyntaxShard>()(
          "id",
          "parent",
          "type",
        );
        if (excludedKeys.includes(key as keyof AST.SyntaxShard)) {
          continue;
        }
        if (value === shard) {
          return { role: key as RelevantFields<T>, roleName: capitalize(key) };
        }
      }

      return { role: null, roleName: null };
    }
    case "Statements":
    case "Identifiers":
    case "Properties":
    case "Values": {
      return {
        role: "contents" as RelevantFields<T>,
        roleName: capitalize(shard.parent.type.slice(0, -1)),
      };
    }
    default:
      assertNever(shard.parent);
  }
}

export function getAllowedShardTypes<T extends AST.CompositeShard>(
  shard: T,
  field: RelevantFields<T>,
): AST.SyntaxShard["type"][] {
  switch (shard.type) {
    case "Program": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Program,
        field,
      );
      switch (typedField) {
        case "body": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Statements");
        }
        default: {
          assertNever(typedField);
        }
      }
    }
    case "Assignment": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Assignment,
        field,
      );
      switch (typedField) {
        case "assignee": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Identifiers");
        }
        case "expression": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()(
            "String",
            "Number",
            "Boolean",
            "Call",
            "Function",
            "Null",
            "Identifiers",
            "Properties",
            "String",
            "Values",
          );
        }
        default: {
          assertNever(typedField);
        }
      }
    }
    case "Call": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Call,
        field,
      );
      switch (typedField) {
        case "arguments": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Values", "Identifiers");
        }
        case "callee": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Identifiers", "Function");
        }
        default: {
          assertNever(typedField);
        }
      }
    }
    case "Definition": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Definition,
        field,
      );
      switch (typedField) {
        case "assignee": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("String", "Number", "Null");
        }
        case "expression": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()(
            "Call",
            "String",
            "Number",
            "Boolean",
            "Null",
            "Values",
            "Identifiers",
            "Properties",
            "Function",
          );
        }
        default: {
          assertNever(typedField);
        }
      }
    }
    case "Function": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Function,
        field,
      );
      switch (typedField) {
        case "parameters": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Identifiers");
        }
        case "body": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("Statements");
        }
      }
    }
    case "Statements": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Statements,
        field,
      );
      switch (typedField) {
        case "contents": {
          return tupleFromUnionType<
            ContentsType<typeof typedShard, typeof typedField>
          >()("Definition", "Assignment", "Call");
        }
      }
    }
    case "Values": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Values,
        field,
      );
      switch (typedField) {
        case "contents": {
          return tupleFromUnionType<
            ContentsType<typeof typedShard, typeof typedField>
          >()(
            "Values",
            "Null",
            "Identifiers",
            "Properties",
            "Boolean",
            "String",
            "Number",
            "Call",
            "Function",
          );
        }
      }
    }
    case "Identifiers": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Identifiers,
        field,
      );
      switch (typedField) {
        case "contents": {
          return tupleFromUnionType<
            ContentsType<typeof typedShard, typeof typedField>
          >()("String", "Number", "Null");
        }
      }
    }
    case "Properties": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Properties,
        field,
      );
      switch (typedField) {
        case "contents": {
          return tupleFromUnionType<
            ContentsType<typeof typedShard, typeof typedField>
          >()("Property");
        }
      }
    }
    case "Property": {
      const [typedShard, typedField] = getTypedShardFieldPair(
        shard as AST.Property,
        field,
      );
      switch (typedField) {
        case "expression": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()(
            "Call",
            "Values",
            "Identifiers",
            "Properties",
            "Null",
            "Number",
            "Boolean",
            "String",
            "Function",
          );
        }
        case "key": {
          return tupleFromUnionType<
            OtherRelevantFieldsType<typeof typedShard, typeof typedField>
          >()("String", "Number", "Null");
        }
      }
    }
    default: {
      assertNever(shard);
    }
  }
}

export function isPrimitive(
  shard: AST.SyntaxShard,
): shard is AST.PrimitiveShard {
  return tupleFromUnionType<AST.PrimitiveShard["type"]>()(
    "String",
    "Boolean",
    "Number",
    "Null",
  ).includes((shard as AST.PrimitiveShard).type);
}

export type ShardGroupChild = AST.SyntaxShard & { parent: AST.ShardGroup };

export function isInShardGroup(
  shard: AST.SyntaxShard,
): shard is ShardGroupChild {
  if (isProgram(shard)) {
    return false;
  }

  return tupleFromUnionType<AST.ShardGroup["type"]>()(
    "Statements",
    "Properties",
    "Identifiers",
    "Values",
  ).includes((shard.parent as AST.ShardGroup).type);
}

export function isProgram(shard: AST.SyntaxShard): shard is AST.Program {
  return shard.type === "Program";
}
