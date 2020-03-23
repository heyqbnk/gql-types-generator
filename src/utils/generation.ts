import {
  DefinitionWithRequiredTypes,
  ParsedGQLEnumType,
  ParsedGQLOperationDefinitionNode,
  ParsedGQLScalarType,
  ParsedGQLType,
  ParsedGQLObjectType,
  ParsedGQLInterfaceType,
  ParsedGQLUnionType,
  Scalars,
  ParsedGQLVariableDefinitions,
} from '../types';
import {
  formatRequiredTypes,
  getCompiledOperationName,
  formatDescription, toCamelCase,
} from './misc';

/**
 * Universal TS definition generator
 * @param {ParsedGQLType} parsedType
 * @param schemaFileName
 * @param scalars
 * @returns {string}
 */
export function generateTSTypeDefinition(
  parsedType: ParsedGQLType,
  schemaFileName: string,
  scalars: Scalars,
): string {
  if ('values' in parsedType) {
    return generateGQLEnum(parsedType);
  }
  if ('types' in parsedType) {
    return generateGQLUnion(parsedType, schemaFileName);
  }
  if ('fields' in parsedType) {
    return generateGQLInterface(parsedType, schemaFileName);
  }
  return generateGQLScalar(parsedType, scalars);
}

/**
 * GQL interface or type => TS interface
 * @param {ParsedGQLObjectType | ParsedGQLInterfaceType} parsedType
 * @param schemaFileName
 * @param importsRequired
 * @returns {string}
 */
export function generateGQLInterface(
  parsedType: ParsedGQLObjectType | ParsedGQLInterfaceType,
  schemaFileName: string,
  importsRequired = false,
): string {
  const {name, description, fields} = parsedType;
  const {definition, requiredTypes} = [...fields].reduce<DefinitionWithRequiredTypes>(
    (acc, f) => {
      const {definition, description, name, requiredTypes} = f;
      const fullDefinition = formatDescription(description, 2)
        + `  ${name}: ${definition};\n`;

      acc.definition += fullDefinition;

      if (importsRequired) {
        for (const type of requiredTypes) {
          if (!acc.requiredTypes.includes(type)) {
            acc.requiredTypes.push(type);
          }
        }
      }
      return acc;
    },
    {definition: '\n', requiredTypes: []},
  );

  return formatRequiredTypes(requiredTypes, schemaFileName)
    + formatDescription(description)
    + `export interface ${name} {${definition}}`
}

/**
 * GQL enum => TS enum
 * @param {ParsedGQLEnumType} parsedType
 * @returns {string}
 */
export function generateGQLEnum(parsedType: ParsedGQLEnumType): string {
  const {name, description, values} = parsedType;
  const content = values.reduce<string>((acc, v) => {
    const {description, value} = v;

    return acc
      + formatDescription(description, 2)
      + `  ${value} = "${value}",\n`;
  }, '\n');

  return formatDescription(description)
    + `export enum ${name} {${content}}`;
}

/**
 * GQL scalar => TS type
 * @param {ParsedGQLScalarType} parsedType
 * @param scalars
 * @returns {string}
 */
export function generateGQLScalar(
  parsedType: ParsedGQLScalarType,
  scalars: Scalars,
): string {
  const {description, name} = parsedType;
  let definition: string | number = 'any';

  if (name in scalars) {
    if (typeof scalars[name] !== 'string' && typeof scalars[name] !== 'number') {
      throw new Error(
        `Unable to use passed scalar ${name} due to its type is not`
        + 'number or string',
      )
    }
    definition = scalars[name];
  }

  return formatDescription(description) + `export type ${name} = ${definition};`
}

/**
 * GQL union => TS type
 * @param {ParsedGQLUnionType} parsedType
 * @param schemaFileName
 * @returns {string}
 */
export function generateGQLUnion(
  parsedType: ParsedGQLUnionType,
  schemaFileName: string,
): string {
  const {description, name, types, requiredTypes} = parsedType;

  return formatRequiredTypes(requiredTypes, schemaFileName)
    + formatDescription(description)
    + `export type ${name} = ${types.join(' | ')};`;
}

/**
 * GQL variables => TS interface
 * @param {ParsedGQLVariableDefinitions} variables
 * @param {string} schemaFileName
 * @param {boolean} importsRequired
 * @returns {string}
 */
export function generateGQLOperationVariables(
  variables: ParsedGQLVariableDefinitions,
  schemaFileName: string,
  importsRequired = false,
): string {
  const {name, fields} = variables;
  const {definition, requiredTypes} = [...fields].reduce<DefinitionWithRequiredTypes>(
    (acc, f) => {
      const {definition, name, requiredTypes} = f;

      acc.definition += `  ${name}: ${definition};\n`;

      if (importsRequired) {
        for (const type of requiredTypes) {
          if (!acc.requiredTypes.includes(type)) {
            acc.requiredTypes.push(type);
          }
        }
      }
      return acc;
    },
    {definition: '\n', requiredTypes: []},
  );

  return formatRequiredTypes(requiredTypes, schemaFileName)
    + `export interface ${name} {${definition}}`
}

/**
 * GQL operation => TS interfaces
 * @returns {string}
 * @param parsedType
 * @param schemaFileName
 * @param defaultExport
 * @param wrapWithTag
 */
export function generateGQLOperation(
  parsedType: ParsedGQLOperationDefinitionNode,
  schemaFileName: string,
  defaultExport: boolean,
  wrapWithTag: boolean,
): string {
  const {
    originalName, operationType, operationDefinition, variables, requiredTypes,
    operationSignature,
  } = parsedType;
  const operationName = getCompiledOperationName(originalName, operationType);
  const operationStringName = originalName + toCamelCase(operationType);
  const variablesDefinition = variables.fields.length === 0 ? '' : (
    generateGQLOperationVariables(variables, schemaFileName, true) + '\n\n'
  );
  const operationConst = wrapWithTag
    ? `const ${operationStringName}: DocumentNode = gql(\`${operationSignature}\`);\n`
    : `const ${operationStringName}: string = \`${operationSignature}\`;\n`;

  // If graphql-tag required, import it
  let gqlTagImport = '';

  if (wrapWithTag) {
    gqlTagImport = 'import gql from \'graphql-tag\';\n'
    + 'import { DocumentNode } from \'graphql\';';
  }

  return gqlTagImport
    // Required types import
    + formatRequiredTypes(requiredTypes, schemaFileName)
    // Operation result interface
    + `export interface ${operationName} ${operationDefinition}\n\n`
    // Operation variables interface
    + variablesDefinition
    // Operation export
    + (defaultExport
      ? (operationConst + `export default ${operationStringName};`)
      : `export ${operationConst}`);
}
