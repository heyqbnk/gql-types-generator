import {
  CompiledTypeName,
  GQLScalarCompiledTypesMap,
  GQLScalarTypeName,
  ParsedGQLType,
  ParsedGQLEnumValue,
  ParsedGQLField,
  ParsedGQLTypeEntity, ParsedGQLEnumEntity,
} from './types';
import {
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';

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
 * @type {GQLScalarTypeName[]}
 */
const gqlScalarTypes = Object.keys(gqlScalarTypesMap) as GQLScalarTypeName[];

/**
 * States if value is GQL scalar type
 * @param value
 * @returns {value is GQLScalarType}
 */
export function isGQLScalarType(value: any): value is GQLScalarTypeName {
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
 * Parses GQL enums
 * @param {EnumTypeDefinitionNode} node
 * @returns {ParsedGQLType}
 */
export function parseEnumDefinitionNode(
  node: EnumTypeDefinitionNode,
): ParsedGQLType {
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
    type: 'enum',
    values: parsedValues,
  };
}

/**
 * Parses GQL types which have fields
 * @param {ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | InputObjectTypeDefinitionNode} node
 * @returns {ParsedGQLType}
 */
export function parseTypeDefinitionNode(
  node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | InputObjectTypeDefinitionNode,
): ParsedGQLType {
  const {fields, description, name} = node;
  const parsedFields = [...fields]
    .reduce<ParsedGQLField[]>((fAcc, f) => {
      if (f.kind === 'FieldDefinition') {
        const {type, description, name} = f;

        fAcc.push({
          definition: getTypeDefinition(type),
          description: description ? description.value : null,
          name: name.value,
        });
      }
      return fAcc;
    }, []);

  return {
    description: description ? description.value : null,
    type: 'type',
    fields: parsedFields,
    name: name.value,
  };
}

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

/**
 * Generates TS "type" definition
 * @param {ParsedGQLTypeEntity} parsedType
 * @returns {string}
 */
export function generateTSType(parsedType: ParsedGQLTypeEntity): string {
  const {name, description, fields} = parsedType;

  return getDescription(description)
    + `export declare type ${name} = {\n`
    + fields.reduce<string>((acc, f) => {
      const {definition, description, name} = f;

      return acc
        + getDescription(description, 2)
        + `  ${name}: ${definition};\n`;
    }, '')
    + '}'
}

/**
 * Generates TS "enum" definition
 * @param {ParsedGQLTypeEntity} parsedType
 * @returns {string}
 */
export function generateTSEnum(parsedType: ParsedGQLEnumEntity): string {
  const {name, description, values} = parsedType;

  return getDescription(description)
    + `export declare enum ${name} {\n`
    + values.reduce<string>((acc, v) => {
      const {description, value} = v;

      return acc
        + getDescription(description, 2)
        + `  ${value},\n`;
    }, '')
    + '}'
}

/**
 * Generates TS representation as string of GQL type
 * @param {ParsedGQLType} parsedType
 * @returns {string}
 */
export function generateType(parsedType: ParsedGQLType): string {
  if (parsedType.type === 'type') {
    return generateTSType(parsedType);
  } else if (parsedType.type === 'enum') {
    return generateTSEnum(parsedType);
  }

  return '';
}
