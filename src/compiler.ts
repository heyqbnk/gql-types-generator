import {buildSchema, parse} from 'graphql';
import {
  CompiledOperation, CompileOperationsOptions,
  CompileOptions,
  CompileSchemaOptions,
} from './types';
import {createDirectory, getFileContent, getPathName} from './fs';
import {
  parseTypeDefinitionNode,
  generateGQLOperation,
  generateTSTypeDefinition,
  getSorter,
  parseOperationDefinitionNode,
  toCamelCase,
  transpileWithFs,
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
    removeDescription,
    display,
    schemaPath,
    operationsPath,
    schemaFileName = 'schema.ts',
    operationsFileName,
  } = options;
  const schemaString = await getFileContent(schemaPath);

  if (schemaString.length === 0) {
    throw new Error('No schema definition was found');
  }

  console.log(yellow('Starting compilation..'));

  // Safely create directories
  await createDirectory(outputDirectory);

  // Firstly compile schema
  const {schema} = await compileSchema({
    schema: schemaString,
    outputDirectory,
    fileName: schemaFileName,
    display,
    removeDescription,
  });

  // Then, compile operations
  const operationsString = operationsPath
    ? await getFileContent(operationsPath)
    : null;

  // index.ts content
  const schemaName = getPathName(schemaFileName);
  let index = `export { default as schema } from './${schemaName}';\n`
    + `export * from './${schemaName}';\n`;

  if (typeof operationsString === 'string') {
    if (operationsString.length === 0) {
      throw new Error('Unable to find operations');
    }
    const {compiledTypes} = await compileOperations({
      operations: operationsString,
      outputDirectory,
      schema,
      schemaFileName,
      removeDescription,
      fileName: operationsFileName,
    });

    if (typeof operationsFileName === 'string') {
      const operationsName = getPathName(operationsFileName);
      index += `export * from './${operationsName}';`;
    } else {
      compiledTypes.forEach(({operationName}) => {
        index += `export * from './${operationName}';\n`
          + `export { default as ${operationName} } from './${operationName}';\n`;
      });
    }
  }

  transpileWithFs(index, 'index.ts', outputDirectory, removeDescription);
  console.log(yellow('Compilation completed successfully..'));
}

/**
 * Compiles schema
 * @param options
 */
export async function compileSchema(options: CompileSchemaOptions) {
  const {
    schema,
    display = 'as-is',
    fileName = 'schema.ts',
    outputDirectory,
    removeDescription = false,
  } = options;

  // Create output directory
  createDirectory(outputDirectory);

  // Build GraphQL schema
  const gqlSchema = buildSchema(schema);

  // Sort types depending on display type
  const types = gqlSchema.toConfig().types.sort(getSorter(display));

  // Get schema definition
  let schemaDefinition = types.reduce<string[]>((acc, type) => {
    // We parse only types used in schema. We can meet internal types. Internal
    // types dont have astNode
    if (type.astNode !== undefined) {
      acc.push(
        generateTSTypeDefinition(parseTypeDefinitionNode(type.astNode), fileName),
      );
    }

    return acc;
  }, []).join('\n\n');

  // Add schema as default export
  const formattedSchema = schema.replace(/'/g, '\'');
  schemaDefinition += `\n\nconst schema: string = \`${formattedSchema}\`;\n`
    + 'export default schema;';

  // Write all the schema into a single file
  transpileWithFs(schemaDefinition, fileName, outputDirectory, removeDescription);

  return {schema: gqlSchema, compiled: schemaDefinition};
}

/**
 * Compiles operations
 * @param options
 */
export async function compileOperations(options: CompileOperationsOptions) {
  const {
    operations,
    fileName,
    outputDirectory,
    removeDescription = false,
    schema,
    schemaFileName,
  } = options;

  // Create output directory
  createDirectory(outputDirectory);

  const documentNode = parse(operations);
  const compiledTypes = documentNode
    .definitions
    .reduce<CompiledOperation[]>((acc, node) => {
      if (node.kind === 'OperationDefinition') {
        const {name, operation} = node;
        const ts = generateGQLOperation(
          parseOperationDefinitionNode(node, schema, operations),
          schemaFileName,
        );

        acc.push({operationName: name.value + toCamelCase(operation), ts});
      }
      return acc;
    }, []);

  // If file name was passed, we have to concatenate all of the operations into
  // a single file
  if (fileName) {
    const concatenated = compiledTypes.map(t => t.ts).join('\n\n');
    transpileWithFs(concatenated, fileName, outputDirectory, removeDescription);
  }
  // Otherwise create types for each operation
  else {
    compiledTypes.forEach(({ts, operationName}) => {
      transpileWithFs(ts, `${operationName}.ts`, outputDirectory, removeDescription);
    });
  }

  return {compiledTypes};
}
