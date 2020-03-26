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
 * List of scalar GQL types
 */
export type GQLScalarType = 'Boolean' | 'Float' | 'String' | 'Int' | 'ID';

/**
 * Adds optional description field
 */
export interface MaybeDescription {
  description?: string;
}

/**
 * Adds import types field
 */
export type WithImportTypes<Required extends boolean = false> =
  Required extends true
    ? { importTypes: string[] }
    : { importTypes?: string[] }

/**
 * Adds field name as required
 */
export interface Named {
  name: string;
}

/**
 * Map of internal types of GQL with compiled TS types. States
 * which internal type converts to which TS type
 */
export type GQLScalarCompiledTypesMap = Record<GQLScalarType, CompiledTypeName>;

/**
 * Definition and require types pair
 */
export interface DefinitionWithImportTypes {
  importTypes: string[];
  definition: string;
}
