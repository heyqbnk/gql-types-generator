import {
  ParsedGQLEnumType, ParsedGQLEnumValue,
  ParsedGQLField,
  ParsedGQLScalarType, ParsedGQLTypeOrInterface,
  ParsedGQLUnionType,
} from '../types';
import {
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import {getTypeDefinition, transpileGQLTypeName} from './misc';

/**
 * Parses GQL enum type
 * @param {EnumTypeDefinitionNode} node
 * @param includeDescription
 * @returns {ParsedGQLEnumType}
 */
export function parseEnumDefinitionNode(
  node: EnumTypeDefinitionNode,
  includeDescription: boolean,
): ParsedGQLEnumType {
  const {values, description, name} = node;
  const parsedValues = values.reduce<ParsedGQLEnumValue[]>((vAcc, v) => {
    const {description, name} = v;

    vAcc.push({
      description: description && includeDescription ? description.value : null,
      value: name.value,
    });

    return vAcc;
  }, []);

  return {
    description: description && includeDescription ? description.value : null,
    name: name.value,
    type: 'enum',
    values: parsedValues,
  };
}

/**
 * Parses GQL types which have fields
 * @param {ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode} node
 * @param includeDescription
 * @returns {ParsedGQLType}
 */
export function parseInterfaceDefinitionNode(
  node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode,
  includeDescription: boolean,
): ParsedGQLTypeOrInterface {
  const {fields, description, name} = node;
  const parsedFields = [...fields]
    .reduce<ParsedGQLField[]>((fAcc, f) => {
      const {type, description, name} = f;

      fAcc.push({
        definition: getTypeDefinition(type),
        description: description && includeDescription
          ? description.value : null,
        name: name.value,
      });
      return fAcc;
    }, []);

  return {
    description: description && includeDescription ? description.value : null,
    type: 'interface',
    fields: parsedFields,
    name: name.value,
  };
}

/**
 * Parses GQL scalar type
 * @param {ScalarTypeDefinitionNode} node
 * @param includeDescription
 * @returns {ParsedGQLScalarType}
 */
export function parseScalarTypeDefinitionNode(
  node: ScalarTypeDefinitionNode,
  includeDescription: boolean,
): ParsedGQLScalarType {
  const {name, description} = node;

  return {
    description: description && includeDescription ? description.value : null,
    type: 'type',
    name: name.value,
  };
}

/**
 * Parses GQL union type
 * @param {UnionTypeDefinitionNode} node
 * @param includeDescription
 * @returns {ParsedGQLUnionType}
 */
export function parseUnionTypeDefinitionNode(
  node: UnionTypeDefinitionNode,
  includeDescription: boolean,
): ParsedGQLUnionType {
  const {name, description, types} = node;

  return {
    type: 'type',
    name: name.value,
    description: description && includeDescription ? description.value : null,
    definition: types.map(t => transpileGQLTypeName(t.name.value)).join(' | '),
  };
}
