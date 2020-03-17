import {
  CompiledTypeName,
  GQLScalarCompiledTypesMap,
  GQLInternalTypeName,
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
 * @type {GQLInternalTypeName[]}
 */
const gqlScalarTypes = Object.keys(gqlScalarTypesMap) as GQLInternalTypeName[];

/**
 * States if value is GQL scalar type
 * @param value
 * @returns {value is GQLScalarType}
 */
export function isGQLScalarType(value: any): value is GQLInternalTypeName {
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

/**
 * Wraps schema with warning that types should be edited due to they are
 * compiled
 * @param {string} types
 * @returns {string}
 */
export function wrapWithWarning(types: string): string {
  const line = '// ' + new Array(20).fill('=').join('') + '\n';
  return line
    + '// THESE TYPES ARE COMPILED VIA GQL-TYPES-GENERATOR AND SHOULD NOT BE\n' +
    '// DIRECTLY EDITED\n'
    + line
    + types;
}
