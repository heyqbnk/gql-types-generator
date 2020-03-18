import {buildSchema, GraphQLSchema, parse} from 'graphql';
import {CompiledOperation, CompileOptions, DisplayType} from './types';
import {getFileContent, write} from './fs';
import {
  parseTypeDefinitionNode,
  generateGQLOperation,
  generateTSTypeDefinition,
  getSorter,
  parseOperationDefinitionNode, toCamelCase, asModuleExports, asExports,
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
  const includeDescription = !removeDescription;
  const schemaString = await getFileContent(schemaPath);

  if (schemaString.length === 0) {
    throw new Error('No schema definition was found');
  }

  console.log(yellow('Starting compilation..'));

  // Firstly compile schema
  const {schema} = await compileSchema(
    schemaString, outputDirectory, includeDescription, display,
  );

  // Then, compile operations
  const operationsString: string | null = operationsPath
    ? await getFileContent(operationsPath)
    : null;
  let indexJsContent = `exports.schema = \`${schemaString}\`;\n`;
  let indexTsContent = `declare const schema: string;\n`
   + 'export default schema;\n';

  if (typeof operationsString === 'string') {
    if (operationsString.length === 0) {
      throw new Error('Unable to find operations');
    }
    const {compiledTypes} =
      await compileOperations(operationsString, outputDirectory, schema);

    compiledTypes.forEach(({operationName, js}) => {
      indexTsContent += `export * from './${operationName}';\n`
        + `export { default as ${operationName} } from './${operationName}';\n`;
      indexJsContent += asExports(operationName, js) + '\n';
    });
  }

  // Create and write index files
  await write(indexTsContent, outputDirectory, 'index.d.ts');
  await write(indexJsContent, outputDirectory, 'index.js');

  console.log(yellow('Compilation completed successfully!'));
}

/**
 * Compiles schema
 * @param schemaString
 * @param {string} outputDirectory
 * @param {boolean} includeDescription
 * @param display
 */
export async function compileSchema(
  schemaString: string,
  outputDirectory: string,
  includeDescription = false,
  display: DisplayType = 'default',
) {
  // Build GraphQL schema
  const schema = buildSchema(schemaString);

  // Sort types depending on display type
  const types = schema.toConfig().types.sort(getSorter(display));

  let compiledTypes = types.reduce<string[]>((acc, type) => {
    // We parse only types used in schema. We can meet internal types. Internal
    // types dont have astNode
    if (type.astNode !== undefined) {
      acc.push(generateTSTypeDefinition(
        parseTypeDefinitionNode(type.astNode, includeDescription),
      ));
    }

    return acc;
  }, []).join('\n\n');

  compiledTypes += '\n\ndeclare const schema: string;\n'
    + `export default schema;`;

  // Write all the schema into a single file
  await write(compiledTypes, outputDirectory, 'schema.d.ts');
  await write(asModuleExports(schemaString), outputDirectory, 'schema.js');

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
        const {name, operation, loc} = node;
        const operationText = operationsString.slice(loc.start, loc.end);
        const ts = generateGQLOperation(parseOperationDefinitionNode(node, schema));

        acc.push({
          operationName: name.value + toCamelCase(operation),
          ts,
          js: operationText,
        });
      }
      return acc;
    }, []);

  await Promise.all(
    compiledTypes.reduce<Promise<any>[]>((acc, {ts, operationName, js}) => {
      acc.push(write(ts, outputDirectory, `${operationName}.d.ts`));
      acc.push(write(asModuleExports(js), outputDirectory, `${operationName}.js`));
      return acc;
    }, []),
  );

  return {
    compiledTypes,
  };
}
