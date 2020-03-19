import {
  DefinitionWithRequiredTypes,
  ParsedGQLEnumType, ParsedGQLOperation,
  ParsedGQLScalarType, ParsedGQLType,
  ParsedGQLTypeOrInterface, ParsedGQLUnionType,
} from '../types';
import {
  formatRequiredTypes,
  getCompiledOperationName,
  formatDescription, toCamelCase,
} from './misc';

/**
 * Universal TS definition generator
 * @param {ParsedGQLType} parsedType
 * @returns {string}
 */
export function generateTSTypeDefinition(parsedType: ParsedGQLType): string {
  if ('values' in parsedType) {
    return generateGQLEnum(parsedType);
  }
  if ('types' in parsedType) {
    return generateGQLUnion(parsedType);
  }
  if ('fields' in parsedType) {
    return generateGQLInterface(parsedType);
  }
  return generateGQLScalar(parsedType);
}

/**
 * GQL interface or type => TS interface
 * @param {ParsedGQLTypeOrInterface} parsedType
 * @param importsRequired
 * @returns {string}
 */
export function generateGQLInterface(
  parsedType: ParsedGQLTypeOrInterface,
  importsRequired = false,
): string {
  const {name, description, fields} = parsedType;
  const {definition, requiredTypes} = fields.reduce<DefinitionWithRequiredTypes>((acc, f) => {
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
  }, {definition: '\n', requiredTypes: []});

  return formatRequiredTypes(requiredTypes)
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
 * @returns {string}
 */
export function generateGQLScalar(parsedType: ParsedGQLScalarType): string {
  const {description, name} = parsedType;

  return formatDescription(description) + `export type ${name} = any;`
}

/**
 * GQL union => TS type
 * @param {ParsedGQLUnionType} parsedType
 * @returns {string}
 */
export function generateGQLUnion(parsedType: ParsedGQLUnionType): string {
  const {description, name, types, requiredTypes} = parsedType;

  return formatRequiredTypes(requiredTypes)
    + formatDescription(description)
    + `export type ${name} = ${types.join(' | ')};`;
}

/**
 * GQL operation => TS interfaces
 * @returns {string}
 * @param parsedType
 */
export function generateGQLOperation(parsedType: ParsedGQLOperation): string {
  const {
    originalName, operationType, operationDefinition, variables, requiredTypes,
    operationSignature,
  } = parsedType;
  const operationName = getCompiledOperationName(originalName, operationType);
  const operationStringName = originalName + toCamelCase(operationType);
  const variablesDefinition = variables.fields.length === 0
    ? ''
    : (generateGQLInterface(variables, true) + '\n\n');

  return formatRequiredTypes(requiredTypes)
    + `export interface ${operationName} ${operationDefinition}\n\n`
    + variablesDefinition
    + `const ${operationStringName}: string = \`${operationSignature}\`;\n`
    + `export default ${operationStringName};`;
}
