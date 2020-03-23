import {
  CompiledTypeName,
  DefinitionWithRequiredTypes,
  MaybeDescription,
} from './shared';
import {OperationTypeNode} from 'graphql';

// Shared
export interface ParsedGQLTypeBase extends MaybeDescription {
  name: string;
}

export interface ParsedGQLNode extends DefinitionWithRequiredTypes {
  name: string;
}

// GQL Enum
export interface ParsedGQLEnumValue extends MaybeDescription {
  value: string;
}

export interface ParsedGQLEnumType extends ParsedGQLTypeBase {
  values: ParsedGQLEnumValue[];
}

// GQL Object
export interface ParsedGQLObjectTypeField extends MaybeDescription, ParsedGQLNode {
  // TODO Arguments
  // args: DefinitionWithRequiredTypes;
}

export interface ParsedGQLObjectType extends ParsedGQLTypeBase {
  fields: ParsedGQLObjectTypeField[];
}

// GQL Interface
export type ParsedGQLInterfaceTypeField = MaybeDescription & ParsedGQLNode;

export interface ParsedGQLInterfaceType extends ParsedGQLTypeBase {
  fields: ParsedGQLInterfaceTypeField[];
}

// GQL Input Object
export type ParsedGQLInputObjectTypeField = MaybeDescription & ParsedGQLNode;

export interface ParsedGQLInputObjectType extends ParsedGQLTypeBase {
  fields: ParsedGQLInputObjectTypeField[];
}

// GQL Scalar
export type ParsedGQLScalarType = ParsedGQLTypeBase;

// GQL Union
export interface ParsedGQLUnionType extends ParsedGQLTypeBase {
  types: CompiledTypeName[];
  requiredTypes: string[];
}

// GQL Operation
export type ParsedGQLVariableDefinitionsField = ParsedGQLNode;

export interface ParsedGQLVariableDefinitions {
  name: string;
  fields: ParsedGQLVariableDefinitionsField[]
}

export interface ParsedGQLOperationDefinitionNode {
  originalName: string;
  operationSignature: string;
  operationType: OperationTypeNode;
  operationDefinition: string;
  requiredTypes: string[];
  variables: ParsedGQLVariableDefinitions;
}

/**
 * List of GQL types which can be parsed
 */
export type ParsedGQLType =
  | ParsedGQLInputObjectType
  | ParsedGQLInterfaceType
  | ParsedGQLObjectType
  | ParsedGQLUnionType
  | ParsedGQLScalarType
  | ParsedGQLEnumType;
