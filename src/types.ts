/**
 * Custom scheme type name
 */
export type CustomTypeName = string;

/**
 * List of TS types which can be used during compilation
 */
export type TSTypeName = 'number' | 'string' | 'boolean' | 'any';

/**
 * List of type names which can be compiled
 */
export type CompiledTypeName = TSTypeName | CustomTypeName;

/**
 * List of keywords in TS creating descriptions of entities
 */
export type TSEntityType = 'interface' | 'type' | 'enum';

/**
 * List of scalar GQL types
 */
export type GQLInternalTypeName = 'Boolean' | 'Float' | 'String' | 'Int' | 'ID';

/**
 * Shared compile function options
 */
export interface CompileOptionsShared {
  outputPath: string;
  removeDescription?: boolean;
  sort?: 'as-is' | 'default';
}

/**
 * Compile function options to compile file
 */
export interface CompileFileOptions extends CompileOptionsShared {
  source: string | string[];
}

/**
 * Compile function options to compile text
 */
export interface CompileTextOptions extends CompileOptionsShared {
  schema: string;
}

/**
 * Possible compile options
 */
export type CompileOptions = CompileFileOptions | CompileTextOptions;

/**
 * Parsed GQL enum value
 */
export interface ParsedGQLEnumValue {
  description: string | null;
  value: string;
}

/**
 * Parsed GQL type field
 */
export interface ParsedGQLField {
  definition: string;
  description: string | null;
  name: string;
}

/**
 * Parsed GQL type converted to TS entity
 */
export interface ParsedGQLTypeBase {
  type: TSEntityType;
  name: string;
  description: string | null;
}

export interface ParsedGQLEnumType extends ParsedGQLTypeBase {
  type: 'enum';
  values: ParsedGQLEnumValue[];
}

export interface ParsedGQLTypeOrInterface extends ParsedGQLTypeBase {
  type: 'interface';
  fields: ParsedGQLField[];
}

export interface ParsedGQLScalarType extends ParsedGQLTypeBase {
  type: 'type';
}

export interface ParsedGQLUnionType extends ParsedGQLTypeBase {
  type: 'type';
  definition: string;
}

/**
 * Parsed GQL type
 */
export type ParsedGQLType = ParsedGQLEnumType
  | ParsedGQLTypeOrInterface
  | ParsedGQLScalarType
  | ParsedGQLUnionType;

/**
 * Map of scalar types of GQL with compiled TS types. States
 * which scalar type converts to which TS type
 */
export type GQLScalarCompiledTypesMap = Record<GQLInternalTypeName, CompiledTypeName>;
