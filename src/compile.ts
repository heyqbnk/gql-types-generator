import {buildSchema} from 'graphql';
import {
  ParsedGQLType, CompileOptions,
} from './types';
import {getFileContent, withCwd, writeFile} from './fs';
import {
  generateType,
  parseEnumDefinitionNode,
  parseTypeDefinitionNode,
} from './utils';

export async function compile(options: CompileOptions) {
  const {outputPath} = options;
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
  const compiledTypes = Object
    .values(typeMap)
    .reduce<string[]>((acc, type) => {
      const {astNode} = type;

      // We parse only types used in schema. We can meet some scalar types
      // in typeMap. Scalar types dont have astNode
      if (astNode !== undefined) {
        let parsedType: ParsedGQLType | null = null;
        if ('fields' in astNode) {
          parsedType = parseTypeDefinitionNode(astNode);
        }

        if ('values' in astNode) {
          parsedType = parseEnumDefinitionNode(astNode);
        }

        if (parsedType) {
          acc.push(generateType(parsedType));
        }
      }

      return acc;
    }, [])
    .join('\n\n');

  writeFile(withCwd(outputPath), compiledTypes);
}
