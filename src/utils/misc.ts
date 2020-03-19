import {
  CompiledTypeName, GQLScalarCompiledTypesMap, GQLScalarType, DisplayType,
  GraphQLNonWrappedType, DefinitionWithRequiredTypes,
} from '../types';
import {
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isEnumType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
  isWrappingType,
  OperationTypeNode,
  TypeNode,
} from 'graphql';
import {getPathName} from '../fs';

/**
 * Returns formatted TS description
 * @param {string} description
 * @param {number} spacesCount
 * @returns {string}
 */
export function formatDescription(
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
 * @type {GQLScalarType[]}
 */
const gqlScalarTypes = Object.keys(gqlScalarTypesMap) as GQLScalarType[];

/**
 * States if value is GQL scalar type
 * @param value
 * @returns {value is GQLScalarType}
 */
export function isGQLScalarType(value: string): value is GQLScalarType {
  return gqlScalarTypes.includes(value as any);
}

/**
 * Converts GQL type name to TS type name. Keeps custom compiled names
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
 * @param requiredTypes
 * @param {boolean} nullable
 * @returns {string}
 */
export function getTypeNodeDefinition(
  node: TypeNode,
  requiredTypes: string[] = [],
  nullable = true,
): DefinitionWithRequiredTypes {
  switch (node.kind) {
    case 'NonNullType':
      return getTypeNodeDefinition(node.type, requiredTypes, false);
    case 'NamedType':
    case 'ListType':
      let definition = '';

      if (node.kind === 'NamedType') {
        const name = node.name.value;
        definition = transpileGQLTypeName(name);

        if (!isGQLScalarType(name) && !requiredTypes.includes(name)) {
          requiredTypes.push(name);
        }
      } else {
        const {
          requiredTypes: _requiredTypes, definition: _definition,
        } = getTypeNodeDefinition(node.type, requiredTypes, true);

        _requiredTypes.forEach(t => {
          if (!isGQLScalarType(t) && !requiredTypes.includes(t)) {
            requiredTypes.push(t);
          }
        });
        definition = `Array<${_definition}>`;
      }

      if (nullable) {
        definition = makeNullable(definition);
      }

      return {definition, requiredTypes};
  }
}

/**
 * Recursively gets type definition getting deeper into types tree
 * @param {GraphQLOutputType} type
 * @param {boolean} nullable
 * @returns {string}
 */
export function getOutputTypeDefinition(
  type: GraphQLOutputType,
  nullable = true,
): string {
  if (isNonNullType(type)) {
    return getOutputTypeDefinition(type.ofType, false);
  }
  let definition = '';
  if (isListType(type)) {
    definition = `Array<${getOutputTypeDefinition(type.ofType)}>`;
  } else if (isScalarType(type)) {
    definition = transpileGQLTypeName(type.name);
  } else if (
    isObjectType(type)
    || isInterfaceType(type)
    || isEnumType(type)
  ) {
    definition = type.name;
  } else if (isUnionType(type)) {
    definition = type.getTypes().map(t => t.name).join(' | ');
  }
  return nullable ? makeNullable(definition) : definition;
}

/**
 * Returns met list and non-nullable wrappers
 * @param {GraphQLOutputType} type
 * @param definition
 * @param nullable
 * @returns {string}
 */
export function getOutputTypeDefinitionWithWrappers(
  type: GraphQLOutputType,
  definition: string,
  nullable = true,
): string {
  if (isNonNullType(type)) {
    return getOutputTypeDefinitionWithWrappers(type.ofType, definition, false);
  }
  let def = definition;

  if (isListType(type)) {
    def = `Array<${def}>`;
  }

  return nullable ? makeNullable(def) : def;
}

/**
 * Returns OutputType description
 * @param {GraphQLOutputType} type
 * @returns {string | null}
 */
export function getOutputTypeDescription(type: GraphQLOutputType): string | null {
  if (isNonNullType(type) || isListType(type)) {
    return getOutputTypeDescription(type.ofType);
  }
  return type.description || null;
}

/**
 * Returns sorter depending on display type
 * @param {DisplayType} display
 * @returns {(a: GraphQLNamedType, b: GraphQLNamedType) => (number | number)}
 */
export function getSorter(display: DisplayType) {
  const weights = {
    ScalarTypeDefinition: 0,
    EnumTypeDefinition: 1,
    InterfaceTypeDefinition: 2,
    InputObjectTypeDefinition: 3,
    UnionTypeDefinition: 4,
    ObjectTypeDefinition: 5,
  };

  return (a: GraphQLNamedType, b: GraphQLNamedType) => {
    if (a.astNode || b.astNode) {
      if (!a.astNode) {
        return -1;
      }
      if (!b.astNode) {
        return 1;
      }
      return display === 'as-is'
        ? a.astNode.loc.start - b.astNode.loc.start
        : weights[a.astNode.kind] - weights[b.astNode.kind];
    }
    return 0;
  }
}

/**
 * Converts text to camel case
 * @param {string} text
 * @returns {string}
 */
export function toCamelCase(text: string): string {
  const cleared = text.replace(/[^\da-z].?/gi, match => {
    return match[1] ? match[1].toUpperCase() : '';
  });
  return cleared[0].toUpperCase() + cleared.slice(1);
}

/**
 * Returns compiled operation name
 * @param {string} name
 * @param {string} operation
 * @returns {string}
 */
export function getCompiledOperationName(
  name: string,
  operation: string,
): string {
  return toCamelCase(name) + toCamelCase(operation);
}

/**
 * Returns operation root node depending on operation type
 * @param {GraphQLSchema} schema
 * @param {OperationTypeNode} operation
 * @returns {GraphQLObjectType}
 */
export function getOperationRootNode(
  schema: GraphQLSchema,
  operation: OperationTypeNode,
): GraphQLObjectType {
  if (operation === 'query') {
    return schema.getQueryType();
  } else if (operation === 'mutation') {
    return schema.getMutationType();
  }
  return schema.getSubscriptionType();
}

/**
 * Returns first met non wrapping GQL type
 * @param {GraphQLOutputType} type
 * @returns {GraphQLNonWrappedType}
 */
export function getFirstNonWrappingType(
  type: GraphQLOutputType,
): GraphQLNonWrappedType {
  return isWrappingType(type) ? getFirstNonWrappingType(type.ofType) : type;
}

/**
 * Gets field type depending on passed path
 * @param rootNode
 * @param {string} path
 * @returns {CompiledTypeName}
 */
export function getIn(rootNode: GraphQLObjectType, path: string): GraphQLOutputType {
  const [firstPartial, ...restPartials] = path.split('.');
  const config = rootNode.toConfig();
  let ref = config.fields[firstPartial].type;

  if (!ref) {
    throw new Error(`Unable to find path ${path}`);
  }
  if (restPartials.length === 0) {
    return ref;
  }

  for (let i = 0; i < restPartials.length; i++) {
    const partial = restPartials[i];

    // Avoid lists and non nulls. We dont care about them
    ref = getFirstNonWrappingType(ref);

    if (!isObjectType(ref) && !isInterfaceType(ref)) {
      throw new Error(`Unable to find path ${path}`);
    }
    ref = ref.getFields()[partial].type;

    if (!ref) {
      throw new Error(`Unable to find path ${path}`);
    }

    // It this partial is the last in path, we have to return type of field
    if (i === restPartials.length - 1) {
      return ref;
    }
  }
}

/**
 * Formats imports for custom types
 * @param {string[]} types
 * @param schemaFileName
 * @returns {string}
 */
export function formatRequiredTypes(types: string[], schemaFileName: string) {
  const schemaName = getPathName(schemaFileName);
  return types.length === 0
    ? ''
    : `import { ${types.join(', ')} } from './${schemaName}';\n\n`;
}
