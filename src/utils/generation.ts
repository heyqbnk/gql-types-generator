import {
  ScalarsMap,
  Union,
  Enum,
  Entity,
  PreparedObject,
  Operation,
  PreparedObjectField,
  OperationRootNamespace, OperationNamespaceField, NamedGQLType, Scalar,
} from '../types';
import {
  formatImportTypes,
  formatDescription,
  toCamelCase,
  withSpaces,
} from './misc';

/**
 * Universal TS definition generator
 * @param type
 * @param scalars
 * @returns {string}
 */
export function generateTSTypeDefinition(
  type: NamedGQLType,
  scalars: ScalarsMap,
): string {
  if (type.__type === 'union') {
    return generateUnion(type);
  }
  if (type.__type === 'scalar') {
    return generateScalar(type, scalars);
  }
  if (type.__type === 'enum') {
    return generateEnum(type);
  }
  return generateEntity(type);
}

/**
 * Converts prepared object field to string
 * @param {PreparedObjectField} field
 * @param includeDescription
 * @returns {string}
 */
export function generatePreparedObjectField(
  field: PreparedObjectField,
  includeDescription = false,
): string {
  const {name, description, type} = field;
  return (includeDescription ? formatDescription(description) : '')
    + `${name}: ${type};\n`;
}

/**
 * Converts prepared object to string
 * @param {PreparedObject} obj
 * @param formatName
 * @param includeDescription
 * @returns {string}
 */
export function generatePreparedObject(
  obj: PreparedObject,
  formatName: boolean,
  includeDescription = false,
): string {
  const {name, description, fields} = obj;
  const definition = fields.reduce<string>((acc, f) => {
    return acc + generatePreparedObjectField(f, false);
  }, '');
  const formattedName = formatName ? toCamelCase(name) : name;

  return (includeDescription ? formatDescription(description) : '')
    + `export interface ${formattedName} {\n`
    + withSpaces(definition, 2)
    + '}\n';
}

/**
 * GQL entity => TS interface + namespace?
 * @param {Entity} entity
 * @returns {string}
 */
export function generateEntity(entity: Entity): string {
  const {namespace, fields} = entity;

  const {name, description, fields: namespaceFields} = namespace;
  const nspDefinition = namespaceFields.reduce<string>((acc, f, idx) => {
    if (idx !== 0) {
      acc += '\n';
    }
    acc += formatDescription(f.description)
      + `export type ${f.name} = ${f.type};\n`;

    if (f.args !== null && f.args.fields.length > 0) {
      const argsDefinition = generatePreparedObject(f.args, true);
      acc += `export namespace ${f.name} {\n`
        + withSpaces(argsDefinition, 2)
        + '\n}\n';
    }

    return acc;
  }, '');

  return formatDescription(description)
    + `export namespace ${name} {\n`
    + withSpaces(nspDefinition, 2)
    + `\n}\n\n`
    + generatePreparedObject(fields, false, false);
}

/**
 * GQL enum => TS enum
 * @returns {string}
 * @param type
 */
export function generateEnum(type: Enum): string {
  const {name, description, values} = type;
  const definition = values.reduce<string>((acc, v) => {
    const {description, name} = v;

    return acc
      + formatDescription(description)
      + `${name} = '${name}',\n`;
  }, '');

  return formatDescription(description)
    + `export enum ${name} {\n`
    + withSpaces(definition, 2)
    + '}\n';
}

/**
 * GQL scalar => TS type
 * @param type
 * @param scalars
 * @returns {string}
 */
export function generateScalar(
  type: Scalar,
  scalars: ScalarsMap,
): string {
  const {description, name} = type;
  let definition: string | number = 'any';

  if (name in scalars) {
    if (typeof scalars[name] !== 'string' && typeof scalars[name] !== 'number') {
      throw new Error(
        `Unable to use passed scalar ${name} due to its type is not`
        + 'number or string',
      );
    }
    definition = scalars[name];
  }

  return formatDescription(description)
    + `export type ${name} = ${definition};\n`;
}

/**
 * GQL union => TS type
 * @returns {string}
 * @param type
 */
export function generateUnion(type: Union): string {
  const {description, name, types} = type;

  return formatDescription(description)
    + `export type ${name} = ${types.join(' | ')};\n`;
}

/**
 * Generates operation namespace field
 * @param {OperationNamespaceField} field
 * @returns {string}
 */
export function generateOperationNamespaceField(
  field: OperationNamespaceField,
): string {
  const {type, description, name, fields} = field;
  let result = formatDescription(description);

  if ('definition' in type) {
    result += formatDescription(description)
      + `export type ${name} = ${type.definition};\n`;
  } else {
    result += generatePreparedObject(type, false, true);

    if (fields && fields.length > 0) {
      const content = fields.reduce<string>((acc, f) => {
        return acc + generateOperationNamespaceField(f);
      }, '');
      result += `export namespace ${name} {\n`
        + withSpaces(content, 2)
        + '}\n';
    }
  }

  return result;
}

/**
 * Generates operation root namespace
 * @param {OperationRootNamespace} nsp
 * @returns {string}
 */
export function generateOperationRootNamespace(
  nsp: OperationRootNamespace,
): string {
  const {name, args, fields} = nsp;
  // Namespace
  let content = generatePreparedObject(args, false);

  fields.forEach(f => {
    content += generateOperationNamespaceField(f);
  });

  return `export namespace ${name} {\n`
    + withSpaces(content, 2)
    + '}\n';
}

/**
 * GQL operation => TS interfaces
 * @returns {string}
 * @param operation
 * @param schemaFileName
 * @param wrapWithTag
 */
export function generateOperation(
  operation: Operation,
  schemaFileName: string,
  wrapWithTag: boolean,
): string {
  const {selection, namespace, name, signature, importTypes} = operation;
  const operationConst = wrapWithTag
    ? `const ${name}: DocumentNode = gql(\`${signature}\`);\n`
    : `const ${name}: string = \`${signature}\`;\n`;

  // If graphql-tag required, import it
  let gqlTagImport = '';

  if (wrapWithTag) {
    gqlTagImport = 'import gql from \'graphql-tag\';\n'
      + 'import { DocumentNode } from \'graphql\';\n\n';
  }

  return gqlTagImport
    // Required types import
    + formatImportTypes(importTypes, schemaFileName)
    // Namespace
    + generateOperationRootNamespace(namespace)
    // Operation result interface
    + generatePreparedObject(selection, true)
    // Operation export
    + `export ${operationConst}`;
}
