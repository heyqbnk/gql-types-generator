import {
  ParsedGQLEnumType,
  ParsedGQLEnumValue,
  ParsedGQLTypeOrInterfaceField,
  ParsedGQLScalarType,
  ParsedGQLTypeOrInterface,
  ParsedGQLUnionType,
  ParsedGQLType,
  ParsedGQLOperation,
  DefinitionWithRequiredTypes,
} from '../types';
import {
  EnumTypeDefinitionNode, GraphQLObjectType, GraphQLSchema,
  InputObjectTypeDefinitionNode, isScalarType,
  ObjectTypeDefinitionNode, OperationDefinitionNode,
  ScalarTypeDefinitionNode, SelectionSetNode, TypeDefinitionNode,
  UnionTypeDefinitionNode, VariableDefinitionNode,
} from 'graphql';
import {
  formatDescription,
  getCompiledOperationName,
  getFirstNonWrappingType,
  getIn,
  getOperationRootNode,
  getOutputTypeDefinition,
  getOutputTypeDefinitionWithWrappers, getOutputTypeDescription,
  getTypeNodeDefinition, isGQLScalarType,
  transpileGQLTypeName,
} from './misc';

/**
 * Universal TypeDefinition parser
 * @param {TypeDefinitionNode} node
 * @returns {ParsedGQLType}
 */
export function parseTypeDefinitionNode(node: TypeDefinitionNode): ParsedGQLType {
  switch (node.kind) {
    case 'ObjectTypeDefinition':
    case 'InputObjectTypeDefinition':
      return parseObjectTypeDefinitionNode(node);
    case 'ScalarTypeDefinition':
      return parseScalarTypeDefinitionNode(node);
    case 'UnionTypeDefinition':
      return parseUnionTypeDefinitionNode(node);
    case 'EnumTypeDefinition':
      return parseEnumDefinitionNode(node);
  }
}

/**
 * Parses GQL enum type
 * @param {EnumTypeDefinitionNode} node
 * @returns {ParsedGQLEnumType}
 */
export function parseEnumDefinitionNode(
  node: EnumTypeDefinitionNode,
): ParsedGQLEnumType {
  const {values, description, name} = node;
  const parsedValues = values.reduce<ParsedGQLEnumValue[]>((vAcc, v) => {
    const {description, name} = v;

    vAcc.push({
      description: description ? description.value : null,
      value: name.value,
    });

    return vAcc;
  }, []);

  return {
    description: description ? description.value : null,
    name: name.value,
    values: parsedValues,
  };
}

/**
 * Parses GQL types which have fields
 * @param {ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode} node
 * @returns {ParsedGQLType}
 */
export function parseObjectTypeDefinitionNode(
  node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode,
): ParsedGQLTypeOrInterface {
  const {fields, description, name} = node;
  const parsedFields = [...fields]
    .reduce<ParsedGQLTypeOrInterfaceField[]>((fAcc, f) => {
      const {type, description, name} = f;
      const {definition, requiredTypes} = getTypeNodeDefinition(type);

      fAcc.push({
        definition,
        description: description ? description.value : null,
        name: name.value,
        requiredTypes,
      });
      return fAcc;
    }, []);

  return {
    description: description ? description.value : null,
    fields: parsedFields,
    name: name.value,
  };
}

/**
 * Parses GQL scalar type
 * @param {ScalarTypeDefinitionNode} node
 * @returns {ParsedGQLScalarType}
 */
export function parseScalarTypeDefinitionNode(
  node: ScalarTypeDefinitionNode,
): ParsedGQLScalarType {
  const {name, description} = node;

  return {
    description: description ? description.value : null,
    name: name.value,
  };
}

/**
 * Parses GQL union type
 * @param {UnionTypeDefinitionNode} node
 * @returns {ParsedGQLUnionType}
 */
export function parseUnionTypeDefinitionNode(
  node: UnionTypeDefinitionNode,
): ParsedGQLUnionType {
  const {name, description, types} = node;
  const requiredTypes = types
    .filter(t => !isGQLScalarType(t.name.value))
    .map(t => t.name.value);

  return {
    name: name.value,
    description: description ? description.value : null,
    requiredTypes,
    types: types.map(t => transpileGQLTypeName(t.name.value)),
  };
}

/**
 * Parses GQL operation variables
 * @param compiledName
 * @param {VariableDefinitionNode[]} nodes
 * @returns {ParsedGQLTypeOrInterface}
 */
export function parseOperationVariableDefinitions(
  compiledName: string,
  nodes: VariableDefinitionNode[],
): ParsedGQLTypeOrInterface {
  return {
    name: `${compiledName}Variables`,
    description: null,
    fields: nodes.map<ParsedGQLTypeOrInterfaceField>(n => {
      const {variable, type} = n;
      const {definition, requiredTypes} = getTypeNodeDefinition(type);

      return {
        name: variable.name.value,
        description: null,
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
        const foundType = getIn(rootNode, path);
        const description = isScalarType(foundType)
          ? null : getOutputTypeDescription(foundType);

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

          // Add all required types if they were not added before
          requiredTypes.forEach(t => {
            if (!acc.requiredTypes.includes(t)) {
              acc.requiredTypes.push(t);
            }
          });
          acc.definition += getOutputTypeDefinitionWithWrappers(foundType, definition);
        } else {
          const {name} = getFirstNonWrappingType(foundType);

          if (!isGQLScalarType(name) && !acc.requiredTypes.includes(name)) {
            acc.requiredTypes.push(name);
          }
          acc.definition += getOutputTypeDefinition(foundType);
        }

        // Definition line end
        acc.definition += ';\n';
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
 * @returns {ParsedGQLOperation}
 */
export function parseOperationDefinitionNode(
  node: OperationDefinitionNode,
  schema: GraphQLSchema,
  operationsString: string,
): ParsedGQLOperation {
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
