import {
  CompiledTypeName,
  MaybeDescription,
  WithImportTypes,
  Named, DefinitionWithImportTypes,
} from './shared';
import {GraphQLOutputType} from 'graphql';

// shared
export interface PreparedObjectField extends MaybeDescription, Named {
  type: CompiledTypeName;
}

export type PreparedObject<ImportRequired extends boolean = false> =
  MaybeDescription
  & Named
  & WithImportTypes<ImportRequired>
  & {
  fields: PreparedObjectField[];
}

// GQL input, type, interface, fragment
export interface EntityNamespaceField extends MaybeDescription, Named {
  type: CompiledTypeName;
  args: PreparedObject | null;
}

export interface EntityNamespace extends MaybeDescription, Named {
  fields: EntityNamespaceField[];
}

export interface Entity extends WithImportTypes<true> {
  __type: 'entity';
  fields: PreparedObject;
  namespace: EntityNamespace;
}

// GQL enum
export type EnumValue = MaybeDescription & Named;

export interface Enum extends MaybeDescription {
  __type: 'enum';
  name: string;
  values: EnumValue[];
}

// GQL scalar
export interface Scalar extends MaybeDescription, Named {
  __type: 'scalar';
}

// GQL union
export interface Union extends MaybeDescription, Named {
  __type: 'union';
  types: CompiledTypeName[];
}

// GQL operation
export interface PreparedOperationNamespaceFieldType extends PreparedObject {
  outputType: GraphQLOutputType;
}

export interface OperationNamespaceField extends MaybeDescription, Named {
  type: DefinitionWithImportTypes | PreparedOperationNamespaceFieldType;
  fields?: OperationNamespaceField[];
}

export interface OperationRootNamespace extends Named, WithImportTypes<true> {
  fields: OperationNamespaceField[];
  args: PreparedObject;
}

export interface Operation extends WithImportTypes<true> {
  __type: 'operation';
  selection: PreparedObject;
  namespace?: OperationRootNamespace;
  name: string;
  signature: string;
}

export type NamedGQLType = Scalar | Enum | Entity | Union;
