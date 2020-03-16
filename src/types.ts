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
export type GQLScalarTypeName = 'Boolean' | 'Float' | 'String' | 'Int' | 'ID';

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
export interface ParsedField {
  definition: string;
  description: string | null;
  name: string;
}

/**
 * Parsed GQL type converted to TS entity
 */
export interface ParsedEntityBase {
  type: TSEntityType;
  name: string;
  description: string | null;
}

export interface ParsedEnumEntity extends ParsedEntityBase {
  type: 'enum';
  values: ParsedGQLEnumValue[];
}

export interface ParsedTypeEntity extends ParsedEntityBase {
  type: 'interface' | 'type';
  fields: ParsedField[];
}

/**
 * Parsed GQL type
 */
export type ParsedEntity = ParsedEnumEntity | ParsedTypeEntity;

/**
 * Map of scalar types of GQL with compiled TS types. States
 * which scalar type converts to which TS type
 */
export type GQLScalarCompiledTypesMap = Record<GQLScalarTypeName, CompiledTypeName>;
