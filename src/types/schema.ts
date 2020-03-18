import {CompiledTypeName, MaybeDescription,} from './shared';
import {OperationTypeNode} from 'graphql';

/**
 * Parsed GQL enum value
 */
export interface ParsedGQLEnumValue extends MaybeDescription {
  value: string;
}

/**
 * Parsed GQL type or interface field
 */
export interface ParsedGQLTypeOrInterfaceField extends MaybeDescription {
  definition: string;
  name: string;
  requiredTypes: string[];
}

/**
 * GQL schema type base
 */
export interface ParsedGQLTypeBase extends MaybeDescription {
  name: string;
}

/**
 * GQL schema enum => TS enum
 */
export interface ParsedGQLEnumType extends ParsedGQLTypeBase {
  values: ParsedGQLEnumValue[];
}

/**
 * GQL schema type or interface => TS interface
 */
export interface ParsedGQLTypeOrInterface extends ParsedGQLTypeBase {
  fields: ParsedGQLTypeOrInterfaceField[];
}

/**
 * GQL schema scalar => TS type
 */
export interface ParsedGQLScalarType extends ParsedGQLTypeBase {
}

/**
 * GQL schema union => TS type
 */
export interface ParsedGQLUnionType extends ParsedGQLTypeBase {
  types: CompiledTypeName[];
}

/**
 * List of parseable GQL types
 */
export type ParsedGQLType = ParsedGQLTypeOrInterface
  | ParsedGQLUnionType
  | ParsedGQLScalarType
  | ParsedGQLEnumType;

/**
 * GQL schema operation => TS types
 */
export interface ParsedGQLOperation {
  originalName: string;
  operationType: OperationTypeNode;
  operationDefinition: string;
  requiredTypes: string[];
  variables: ParsedGQLTypeOrInterface;
}
