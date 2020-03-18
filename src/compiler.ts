import {buildSchema, GraphQLSchema, parse} from 'graphql';
import {CompiledOperation, CompileOptions, DisplayType} from './types';
import {getFileContent, write} from './fs';
import {
  parseTypeDefinitionNode,
  generateGQLOperation,
  generateTSTypeDefinition,
  getSorter,
  wrapWithWarning,
  getCompiledOperationName, parseOperation,
} from './utils';
import {yellow} from 'chalk';

/**
 * Compiles schema partials to TS types
 * @param {CompileOptions} options
 * @returns {Promise<void>}
 */
export async function compile(options: CompileOptions) {
  const {
    operationsPath,
    flattenOperations = false,
    outputDirectory,
    display = 'default',
    removeDescription = false,
  } = options;
  const includeDescription = !removeDescription;
  let schemaString: string = null;

  if ('schemaPath' in options) {
    schemaString = await getFileContent(options.schemaPath);
  } else {
    schemaString = options.schema;
  }

  console.log(yellow('Starting compilation with options:'), {
    operationsPath,
    flattenOperations,
    outputDirectory,
    display,
    removeDescription,
  });

  if (schemaString.length === 0) {
    throw new Error('No schema definition was found');
  }

  // Firstly compile schema
  const {schema} = compileSchema(
    schemaString, outputDirectory, includeDescription, display,
  );

  // Then, compile operations
  const operationsString = operationsPath
    ? await getFileContent(operationsPath) : null;

  if (typeof operationsString === 'string') {
    if (operationsString.length === 0) {
      throw new Error(
        'Unable to find operations with glob(s): ' + operationsPath,
      );
    }
    compileOperations(
      operationsString, outputDirectory, schema, flattenOperations,
    );
  }

  console.log(yellow('Compilation completed successfully!'));
}

/**
 * Compiles schema
 * @param schemaString
 * @param {string} outputDirectory
 * @param {boolean} includeDescription
 * @param display
 */
export function compileSchema(
  schemaString: string,
  outputDirectory: string,
  includeDescription = false,
  display: DisplayType = 'default',
) {
  // Build GraphQL schema
  const schema = buildSchema(schemaString);

  // Sort types depending on display type
  const types = Object.values(schema.getTypeMap()).sort(getSorter(display));

  const compiledTypes = types.reduce<string[]>((acc, type) => {
    // We parse only types used in schema. We can meet internal types. Internal
    // types dont have astNode
    if (type.astNode !== undefined) {
      acc.push(generateTSTypeDefinition(
        parseTypeDefinitionNode(type.astNode, includeDescription),
      ));
    }

    return acc;
  }, []).join('\n\n');

  // Write all the schema into a single file
  write(wrapWithWarning(compiledTypes), outputDirectory, 'schema.d.ts');

  return {
    schema,
  }
}

/**
 * Compiles operations
 * @param {string} operationsString
 * @param {string} outputDirectory
 * @param schema
 * @param {boolean} flattenOperations
 */
export function compileOperations(
  operationsString: string,
  outputDirectory: string,
  schema: GraphQLSchema,
  flattenOperations: boolean,
) {
  const documentNode = parse(operationsString);
  const compiledTypes = documentNode
    .definitions
    .reduce<CompiledOperation[]>((acc, node) => {
      if (node.kind === 'OperationDefinition') {
        const {name, operation} = node;
        const compiledText = generateGQLOperation(parseOperation(node, schema));

        acc.push({
          operationName: getCompiledOperationName(name.value, operation),
          compiledText,
        });
      }
      return acc;
    }, []);

  // Write all the operations into a single file
  if (flattenOperations) {
    const contents = compiledTypes.map(c => c.compiledText).join('\n\n');
    write(outputDirectory, 'operations.d.ts', wrapWithWarning(contents));
  }
  // Or create a new file for each query
  else {
    compiledTypes.forEach(c => {
      write(
        wrapWithWarning(c.compiledText),
        outputDirectory,
        `${c.operationName}.d.ts`,
      );
    });
  }
}
