import {buildSchema} from 'graphql';
import {CompileOptions} from './types';
import {getFileContent, writeFile} from './fs';
import {
  parseEnumDefinitionNode,
  parseInterfaceDefinitionNode,
  parseScalarTypeDefinitionNode,
  parseUnionTypeDefinitionNode,
} from './utils';
import {
  generateGQLEnum,
  generateGQLInterface,
  generateGQLScalar, generateGQLUnion,
} from './utils/generation';
import {wrapWithWarning} from './utils/misc';

const weights = {
  ScalarTypeDefinition: 0,
  EnumTypeDefinition: 1,
  InterfaceTypeDefinition: 2,
  InputObjectTypeDefinition: 3,
  UnionTypeDefinition: 4,
  ObjectTypeDefinition: 5,
};

/**
 * Compiles schema artifacts to TS types
 * @param {CompileOptions} options
 * @returns {Promise<void>}
 */
export async function compile(options: CompileOptions) {
  const {outputPath, sort, removeDescription} = options;
  const includeDescription = !removeDescription;
  let schemaString: string = '';

  if ('source' in options) {
    schemaString = await getFileContent(options.source);
  } else {
    schemaString = options.schema;
  }

  // Building schema
  const schema = buildSchema(schemaString);

  // Getting types map
  const typeMap = schema.getTypeMap();

  // Accumulator containing compiled types
  let compiledTypes = Object
  // Get all types
    .values(typeMap)
    // Sort depending on sorting type
    .sort((a, b) => {
      if (a.astNode || b.astNode) {
        if (!a.astNode) {
          return -1;
        }
        if (!b.astNode) {
          return 1;
        }
        return sort === 'as-is'
          ? a.astNode.loc.start - b.astNode.loc.start
          : weights[a.astNode.kind] - weights[b.astNode.kind];
      }
      return 0;
    })
    .reduce<string[]>((acc, type) => {
      const {astNode} = type;

      // We parse only types used in schema. We can meet some scalar types
      // in typeMap. Internal types dont have astNode
      if (astNode !== undefined) {
        switch (astNode.kind) {
          case 'ObjectTypeDefinition':
          case 'InputObjectTypeDefinition':
            acc.push(
              generateGQLInterface(
                parseInterfaceDefinitionNode(astNode, includeDescription),
              ),
            );
            break;
          case 'ScalarTypeDefinition':
            acc.push(
              generateGQLScalar(
                parseScalarTypeDefinitionNode(astNode, includeDescription),
              ),
            );
            break;
          case 'UnionTypeDefinition':
            acc.push(
              generateGQLUnion(
                parseUnionTypeDefinitionNode(astNode, includeDescription),
              ),
            );
            break;
          case 'EnumTypeDefinition':
            acc.push(
              generateGQLEnum(
                parseEnumDefinitionNode(astNode, includeDescription),
              ),
            );
            break;
        }
      }

      return acc;
    }, [])
    .join('\n\n');

  // Add warning that these types are compiled and should not be edited
  compiledTypes = wrapWithWarning(compiledTypes);

  writeFile(outputPath, compiledTypes);
}
