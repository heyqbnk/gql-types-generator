import {
  ParsedGQLEnumType,
  ParsedGQLEnumValue,
  ParsedGQLScalarType,
  ParsedGQLUnionType,
  ParsedGQLType,
  ParsedGQLOperationDefinitionNode,
  DefinitionWithRequiredTypes,
  ParsedGQLInputObjectType,
  ParsedGQLObjectType,
  ParsedGQLObjectTypeField,
  ParsedGQLInputObjectTypeField,
  ParsedGQLVariableDefinitions,
  ParsedGQLVariableDefinitionsField,
  ParsedGQLInterfaceType,
} from '../types';
import {
  GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema, GraphQLUnionType,
  isEnumType, isInputObjectType, isObjectType,
  isScalarType, isUnionType,
  OperationDefinitionNode,
  SelectionSetNode,
  VariableDefinitionNode,
} from 'graphql';
import {
  formatDescription,
  getCompiledOperationName,
  getIn, getIOTypeDefinition,
  getOperationRootNode,
  getOutputTypeDefinitionWithWrappers,
  getTypeNodeDefinition, isGQLScalarType,
  transpileGQLTypeName,
} from './misc';

/**
 * Universal TypeDefinition parser
 * @returns {ParsedGQLType}
 * @param type
 */
export function parseNamedType(type: GraphQLNamedType): ParsedGQLType | null {
  if (!type.astNode) {
    return null;
  } else if (isScalarType(type)) {
    return parseScalarType(type);
  } else if (isUnionType(type)) {
    return parseUnionType(type);
  } else if (isEnumType(type)) {
    return parseEnumType(type);
  } else if (isObjectType(type)) {
    return parseObjectType(type)
  } else if (isInputObjectType(type)) {
    return parseInputObjectType(type);
  }
  return parseInterfaceType(type);
}

/**
 * Parses GQL enum type
 * @returns {ParsedGQLEnumType}
 * @param type
 */
export function parseEnumType(type: GraphQLEnumType): ParsedGQLEnumType {
  const {description, name} = type;
  const values = type.getValues();
  const parsedValues = values.map<ParsedGQLEnumValue>(v => {
    const {description, name} = v;
    return {description, value: name};
  }, []);

  return {description, name, values: parsedValues};
}

/**
 * Parses GQL interface type
 * @param {GraphQLInterfaceType} type
 * @returns {ParsedGQLInterfaceType}
 */
export function parseInterfaceType(
  type: GraphQLInterfaceType,
): ParsedGQLInterfaceType {
  const {description, name} = type;
  const parsedFields = Object.values(type.getFields())
    .map<ParsedGQLObjectTypeField>(f => {
      const {type, description, name} = f;
      const {definition, requiredTypes} = getIOTypeDefinition(type);

      return {definition, description, name, requiredTypes};
    }, []);

  return {description, fields: parsedFields, name};
}

/**
 * Parses GQL object type
 * @returns {ParsedGQLType}
 * @param type
 */
export function parseObjectType(
  type: GraphQLObjectType,
): ParsedGQLObjectType {
  const {description, name} = type;
  const parsedFields = Object.values(type.getFields())
    .map<ParsedGQLObjectTypeField>(f => {
      const {type, description, name} = f;
      const {definition, requiredTypes} = getIOTypeDefinition(type);

      return {
        definition,
        description,
        name,
        requiredTypes,
      };
    }, []);

  return {description, fields: parsedFields, name};
}

/**
 * Parses GQL input object type
 * @returns {ParsedGQLInputObjectType}
 * @param type
 */
export function parseInputObjectType(
  type: GraphQLInputObjectType,
): ParsedGQLInputObjectType {
  const {description, name} = type;
  const parsedFields = Object.values(type.getFields())
    .map<ParsedGQLInputObjectTypeField>(f => {
      const {type, description, name} = f;
      const {definition, requiredTypes} = getIOTypeDefinition(type);

      return {
        definition,
        description,
        name,
        requiredTypes,
      };
    }, []);

  return {description, fields: parsedFields, name};
}

/**
 * Parses GQL scalar type
 * @returns {ParsedGQLScalarType}
 * @param type
 */
export function parseScalarType(type: GraphQLScalarType): ParsedGQLScalarType {
  const {name, description} = type;
  return {description, name};
}

/**
 * Parses GQL union type
 * @returns {ParsedGQLUnionType}
 * @param type
 */
export function parseUnionType(type: GraphQLUnionType): ParsedGQLUnionType {
  const {name, description, getTypes} = type;
  const types = getTypes();
  const requiredTypes = getTypes()
    .filter(t => !isGQLScalarType(t.name))
    .map(t => t.name);

  return {
    name,
    description,
    requiredTypes,
    types: types.map(t => transpileGQLTypeName(t.name)),
  };
}

/**
 * Parses GQL operation variables
 * @param {string} compiledName
 * @param {VariableDefinitionNode[]} nodes
 * @returns {ParsedGQLVariableDefinitions}
 */
export function parseOperationVariableDefinitions(
  compiledName: string,
  nodes: VariableDefinitionNode[],
): ParsedGQLVariableDefinitions {
  return {
    name: `${compiledName}Variables`,
    fields: nodes.map<ParsedGQLVariableDefinitionsField>(n => {
      const {variable, type} = n;
      const {definition, requiredTypes} = getTypeNodeDefinition(type);

      return {
        name: variable.name.value,
        definition,
        requiredTypes,
      };
    }, {}),
  };
}

/**
 * Gets selection's set required types and definition
 * @param {GraphQLObjectType} rootNode
 * @param {GraphQLSchema} schema
 * @param {SelectionSetNode} selectionSet
 * @param {string} operationFieldPath
 * @param {number} spacesCount
 * @returns {string}
 */
export function parseSelectionSet(
  rootNode: GraphQLObjectType,
  schema: GraphQLSchema,
  selectionSet: SelectionSetNode,
  operationFieldPath = '',
  spacesCount = 0,
): DefinitionWithRequiredTypes {
  const bracketSpaces = new Array(spacesCount).fill(' ').join('');
  const lineSpaces = bracketSpaces + new Array(2).fill(' ').join('');

  return selectionSet
    .selections
    .reduce<DefinitionWithRequiredTypes>((acc, s, idx, arr) => {
      // TODO: Fragments and inline fragments support
      if (s.kind === 'Field') {
        const name = s.name.value;
        const path = operationFieldPath.length === 0
          ? name
          : `${operationFieldPath}.${name}`;
        const field = getIn(rootNode, path);
        const description = field.description;
        let currentRequiredTypes: string[] = [];

        if (description) {
          acc.definition += formatDescription(description, spacesCount + 2)
        }

        // Definition line start
        acc.definition += `${lineSpaces}${name}: `;

        // Definition line content
        if (s.selectionSet) {
          const {definition, requiredTypes} = parseSelectionSet(
            rootNode, schema, s.selectionSet, path, spacesCount + 2,
          );
          currentRequiredTypes = requiredTypes;
          acc.definition += getOutputTypeDefinitionWithWrappers(field.type, definition);
        } else {
          const {definition, requiredTypes} = getIOTypeDefinition(field.type);
          currentRequiredTypes = requiredTypes;
          acc.definition += definition;
        }

        // Definition line end
        acc.definition += ';\n';

        // Add all required types if they were not added before
        currentRequiredTypes.forEach(t => {
          if (!acc.requiredTypes.includes(t)) {
            acc.requiredTypes.push(t);
          }
        });
      }

      // If it was last selection, close definition
      if (idx === arr.length - 1) {
        acc.definition += `${bracketSpaces}}`;
      }
      return acc;
    }, {requiredTypes: [], definition: '{\n'});
}

/**
 * Parses GQL operation
 * @param {OperationDefinitionNode} node
 * @param {GraphQLSchema} schema
 * @param operationsString
 * @returns {ParsedGQLOperationDefinitionNode}
 */
export function parseOperationDefinitionNode(
  node: OperationDefinitionNode,
  schema: GraphQLSchema,
  operationsString: string,
): ParsedGQLOperationDefinitionNode {
  const {name, selectionSet, operation, variableDefinitions, loc} = node;
  const originalName = name.value;
  const rootNode = getOperationRootNode(schema, operation);
  const {definition, requiredTypes} = parseSelectionSet(rootNode, schema, selectionSet);
  const variables = parseOperationVariableDefinitions(
    getCompiledOperationName(originalName, operation), [...variableDefinitions],
  );

  // Extract variables required types
  const allRequiredTypes = variables.fields
    .map(f => f.requiredTypes)
    .flat()
    .concat(...requiredTypes)
    .filter((t, idx, arr) => arr.indexOf(t, idx + 1) === -1);

  // Drop already extracted required types
  variables.fields.forEach(f => f.requiredTypes = []);

  return {
    originalName,
    operationSignature: operationsString.slice(loc.start, loc.end),
    operationType: operation,
    operationDefinition: definition,
    requiredTypes: allRequiredTypes,
    variables,
  };
}
