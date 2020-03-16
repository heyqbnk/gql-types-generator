import {
  CompiledTypeName,
  GQLScalarCompiledTypesMap,
  GQLScalarTypeName,
} from '../types';
import {TypeNode} from 'graphql';

/**
 * Returns formatted TS description
 * @param {string} description
 * @param {number} spacesCount
 * @returns {string}
 */
export function getDescription(
  description: string | null,
  spacesCount: number = 0,
): string {
  const before = new Array(spacesCount).fill(' ').join('');

  return description
    ? `${before}/**\n`
    + `${before} * ${description}\n`
    + `${before} */\n`
    : '';
}

// Defines which GQL type converts to which TypeScript type
const gqlScalarTypesMap: GQLScalarCompiledTypesMap = {
  Boolean: 'boolean',
  Float: 'number',
  String: 'string',
  Int: 'number',
  ID: 'any',
};

/**
 * List of GQL scalar types
 * @type {GQLScalarTypeName[]}
 */
const gqlScalarTypes = Object.keys(gqlScalarTypesMap) as GQLScalarTypeName[];

/**
 * States if value is GQL scalar type
 * @param value
 * @returns {value is GQLScalarType}
 */
export function isGQLScalarType(value: any): value is GQLScalarTypeName {
  return gqlScalarTypes.includes(value);
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
export function transpileGQLTypeName(value: string): CompiledTypeName {
  return isGQLScalarType(value) ? gqlScalarTypesMap[value] : value;
}

/**
 * Makes type nullable
 * @returns {string}
 * @param type
 */
export function makeNullable(type: string): string {
  return `${type} | null`;
}

/**
 * Recursively gets type definition getting deeper into types tree
 * @param {TypeNode} node
 * @param {boolean} nullable
 * @returns {string}
 */
export function getTypeDefinition(node: TypeNode, nullable = true): string {
  switch (node.kind) {
    case 'NonNullType':
      return getTypeDefinition(node.type, false);
    case 'NamedType':
    case 'ListType':
      let definition = '';

      if (node.kind === 'NamedType') {
        definition = transpileGQLTypeName(node.name.value);
      } else {
        definition = `Array<${getTypeDefinition(node.type, true)}>`;
      }

      if (nullable) {
        definition = makeNullable(definition);
      }

      return definition;
  }
}
