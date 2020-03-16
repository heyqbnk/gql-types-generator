import {
  ParsedGQLEnumType,
  ParsedGQLScalarType,
  ParsedGQLTypeOrInterface, ParsedGQLUnionType,
} from '../types';
import {getDescription} from './misc';

/**
 * Converts GQL's interface or type to TS
 * @param {ParsedGQLTypeOrInterface} parsedType
 * @returns {string}
 */
export function generateGQLInterface(
  parsedType: ParsedGQLTypeOrInterface,
): string {
  const {name, description, fields} = parsedType;

  return getDescription(description)
    + `export declare interface ${name} {\n`
    + fields.reduce<string>((acc, f) => {
      const {definition, description, name} = f;

      return acc
        + getDescription(description, 2)
        + `  ${name}: ${definition};\n`;
    }, '')
    + '}'
}

/**
 * Converts GQL's enum to TS
 * @param {ParsedGQLEnumType} parsedType
 * @returns {string}
 */
export function generateGQLEnum(parsedType: ParsedGQLEnumType): string {
  const {name, description, values} = parsedType;

  return getDescription(description)
    + `export declare enum ${name} {\n`
    + values.reduce<string>((acc, v) => {
      const {description, value} = v;

      return acc
        + getDescription(description, 2)
        + `  ${value} = "${value}",\n`;
    }, '')
    + '}'
}

/**
 * Converts GQL's scalar to TS
 * @param {ParsedGQLScalarType} parsedType
 * @returns {string}
 */
export function generateGQLScalar(parsedType: ParsedGQLScalarType): string {
  const {description, name} = parsedType;

  return getDescription(description) + `export declare type ${name} = any;`
}

/**
 * Converts GQL's union to TS
 * @param {ParsedGQLUnionType} parsedType
 * @returns {string}
 */
export function generateGQLUnion(parsedType: ParsedGQLUnionType): string {
  const {description, name, definition} = parsedType;

  return getDescription(description)
    + `export declare type ${name} = ${definition};`;
}
