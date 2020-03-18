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
  getFirstNonWrappingType,
  getIn, getOperationRootNode, getOutputTypeDefinition,
  getTypeNodeDefinition, toCamelCase,
  transpileGQLTypeName, uniqueArray,
} from './misc';

/**
 * Universal TypeDefinition parser
 * @param {TypeDefinitionNode} node
 * @param {boolean} includeDescription
 * @returns {ParsedGQLType}
 */
export function parseTypeDefinitionNode(
  node: TypeDefinitionNode,
  includeDescription: boolean,
): ParsedGQLType {
  switch (node.kind) {
    case 'ObjectTypeDefinition':
    case 'InputObjectTypeDefinition':
      return parseInterfaceDefinitionNode(node, includeDescription);
    case 'ScalarTypeDefinition':
      return parseScalarTypeDefinitionNode(node, includeDescription);
    case 'UnionTypeDefinition':
      return parseUnionTypeDefinitionNode(node, includeDescription);
    case 'EnumTypeDefinition':
      return parseEnumDefinitionNode(node, includeDescription);
  }
}

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
    .reduce<ParsedGQLTypeOrInterfaceField[]>((fAcc, f) => {
      const {type, description, name} = f;
      const {definition, requiredTypes} = getTypeNodeDefinition(type);

      fAcc.push({
        definition,
        description: description && includeDescription
          ? description.value : null,
        name: name.value,
        requiredTypes,
      });
      return fAcc;
    }, []);

  return {
    description: description && includeDescription ? description.value : null,
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
    name: name.value,
    description: description && includeDescription ? description.value : null,
    types: types.map(t => transpileGQLTypeName(t.name.value)),
  };
}

/**
 * Parses GQL operation variables
 * @param operationOriginalName
 * @param {VariableDefinitionNode[]} nodes
 * @returns {ParsedGQLTypeOrInterface}
 */
export function parseOperationVariableDefinitions(
  operationOriginalName: string,
  nodes: VariableDefinitionNode[],
): ParsedGQLTypeOrInterface {
  return {
    name: `${toCamelCase(operationOriginalName)}Variables`,
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
 * Converts selection set to TypeScript definition represented as text
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
      if (s.kind === 'Field') {
        const name = s.name.value;
        const path = operationFieldPath.length === 0
          ? name
          : `${operationFieldPath}.${name}`;
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
          acc.definition += definition;
        } else {
          const foundType = getIn(rootNode, path);
          const firstNonWrapping = getFirstNonWrappingType(foundType);
          if (
            !isScalarType(firstNonWrapping)
            && !acc.requiredTypes.includes(firstNonWrapping.name)
          ) {
            acc.requiredTypes.push(firstNonWrapping.name);
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
 * @returns {ParsedGQLOperation}
 */
export function parseOperation(
  node: OperationDefinitionNode,
  schema: GraphQLSchema,
): ParsedGQLOperation {
  const {name, selectionSet, operation, variableDefinitions} = node;
  const rootNode = getOperationRootNode(schema, operation);
  const originalName = name.value;
  const {definition, requiredTypes} = parseSelectionSet(rootNode, schema, selectionSet);
  const variables = parseOperationVariableDefinitions(
    originalName, [...variableDefinitions],
  );
  const variablesRequiredTypes = variables.fields.map(f => {
    const t = f.requiredTypes;
    f.requiredTypes = [];
    return t;
  }).flat();
  const typesToImport = uniqueArray([...requiredTypes, ...variablesRequiredTypes]);

  return {
    originalName,
    operationType: operation,
    operationDefinition: definition,
    requiredTypes: typesToImport,
    variables,
  };
}
