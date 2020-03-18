import {
  DefinitionWithRequiredTypes,
  ParsedGQLEnumType, ParsedGQLOperation,
  ParsedGQLScalarType, ParsedGQLType,
  ParsedGQLTypeOrInterface, ParsedGQLUnionType,
} from '../types';
import {
  formatRequiredTypes,
  getCompiledOperationName,
  formatDescription,
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
 * @returns {string}
 */
export function generateGQLInterface(
  parsedType: ParsedGQLTypeOrInterface,
): string {
  const {name, description, fields} = parsedType;
  const {definition, requiredTypes} = fields.reduce<DefinitionWithRequiredTypes>((acc, f) => {
    const {definition, description, name, requiredTypes} = f;
    const fullDefinition = formatDescription(description, 2)
      + `  ${name}: ${definition};\n`;

    acc.definition += fullDefinition;

    for (const type of requiredTypes) {
      if (!acc.requiredTypes.includes(type)) {
        acc.requiredTypes.push(type);
      }
    }
    return acc;
  }, {definition: '\n', requiredTypes: []});

  return formatRequiredTypes(requiredTypes)
    + formatDescription(description)
    + `export declare interface ${name} {${definition}}`
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
    + `export declare enum ${name} {${content}}`;
}

/**
 * GQL scalar => TS type
 * @param {ParsedGQLScalarType} parsedType
 * @returns {string}
 */
export function generateGQLScalar(parsedType: ParsedGQLScalarType): string {
  const {description, name} = parsedType;

  return formatDescription(description) + `export declare type ${name} = any;`
}

/**
 * GQL union => TS type
 * @param {ParsedGQLUnionType} parsedType
 * @returns {string}
 */
export function generateGQLUnion(parsedType: ParsedGQLUnionType): string {
  const {description, name, types} = parsedType;

  return formatDescription(description)
    + `export declare type ${name} = ${types.join(' | ')};`;
}

/**
 * GQL operation => TS interfaces
 * @returns {string}
 * @param parsedType
 */
export function generateGQLOperation(
  parsedType: ParsedGQLOperation,
): string {
  const {
    originalName, operationType, operationDefinition, variables, requiredTypes,
  } = parsedType;
  const operationName = getCompiledOperationName(originalName, operationType);

  return formatRequiredTypes(requiredTypes)
    + `export declare interface ${operationName} ${operationDefinition}\n\n`
    + generateGQLInterface(variables);
}
