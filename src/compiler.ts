import {buildSchema, GraphQLSchema, parse} from 'graphql';
import {CompiledOperation, CompileOptions, DisplayType} from './types';
import {createDirectory, getFileContent, writeFile} from './fs';
import {transpile} from './utils';
import * as path from 'path';
import rimraf from 'rimraf';
import {
  parseTypeDefinitionNode,
  generateGQLOperation,
  generateTSTypeDefinition,
  getSorter,
  parseOperationDefinitionNode,
  toCamelCase,
} from './utils';
import {yellow} from 'chalk';

/**
 * Compiles schema partials to TS types
 * @param {CompileOptions} options
 * @returns {Promise<void>}
 */
export async function compile(options: CompileOptions) {
  const {
    outputDirectory,
    display = 'default',
    removeDescription = false,
    schemaPath,
    operationsPath,
  } = options;
  const schemaString = await getFileContent(schemaPath);

  if (schemaString.length === 0) {
    throw new Error('No schema definition was found');
  }

  console.log(yellow('Starting compilation..'));

  // Safely create directories
  const tempDir = path.resolve(outputDirectory, '__temp');
  await createDirectory(outputDirectory);
  await createDirectory(tempDir);

  // Firstly compile schema
  const {schema} = await compileSchema(schemaString, tempDir, display);

  // Then, compile operations
  const operationsString = operationsPath
    ? await getFileContent(operationsPath)
    : null;

  // index.ts content
  let index = `export { default as schema } from './schema';\n`
    + `export * from './schema';\n`;

  if (typeof operationsString === 'string') {
    if (operationsString.length === 0) {
      throw new Error('Unable to find operations');
    }
    const {compiledTypes} =
      await compileOperations(operationsString, tempDir, schema);

    compiledTypes.forEach(({operationName}) => {
      index += `export * from './${operationName}';\n`
        + `export { default as ${operationName} } from './${operationName}';\n`;
    });
  }

  writeFile(tempDir, 'index.ts', index);
  transpile(tempDir, outputDirectory, removeDescription);
  rimraf(tempDir, () => {
    console.log(yellow('Compilation completed successfully!'));
  });
}

/**
 * Compiles schema
 * @param schemaString
 * @param {string} outputDirectory
 * @param removeDescription
 * @param display
 */
export async function compileSchema(
  schemaString: string,
  outputDirectory: string,
  display: DisplayType = 'default',
) {
  // Build GraphQL schema
  const schema = buildSchema(schemaString);

  // Sort types depending on display type
  const types = schema.toConfig().types.sort(getSorter(display));

  let schemaDefinition = types.reduce<string[]>((acc, type) => {
    // We parse only types used in schema. We can meet internal types. Internal
    // types dont have astNode
    if (type.astNode !== undefined) {
      acc.push(generateTSTypeDefinition(parseTypeDefinitionNode(type.astNode)));
    }

    return acc;
  }, []).join('\n\n');

  // Add schema as default export
  schemaDefinition += `\n\nconst schema: string = \`${schemaString}\`;\n`
    + `export default schema;`;

  // Write all the schema into a single file
  writeFile(outputDirectory, 'schema.ts', schemaDefinition);

  return {schema}
}

/**
 * Compiles operations
 * @param {string} operationsString
 * @param {string} outputDirectory
 * @param schema
 */
export async function compileOperations(
  operationsString: string,
  outputDirectory: string,
  schema: GraphQLSchema,
) {
  const documentNode = parse(operationsString);
  const compiledTypes = documentNode
    .definitions
    .reduce<CompiledOperation[]>((acc, node) => {
      if (node.kind === 'OperationDefinition') {
        const {name, operation} = node;
        const ts = generateGQLOperation(
          parseOperationDefinitionNode(node, schema, operationsString),
        );

        acc.push({operationName: name.value + toCamelCase(operation), ts});
      }
      return acc;
    }, []);

  compiledTypes.forEach(({ts, operationName}) => {
    writeFile(outputDirectory, `${operationName}.ts`, ts);
  });

  return {compiledTypes};
}
