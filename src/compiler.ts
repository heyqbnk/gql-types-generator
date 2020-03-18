import {buildSchema, GraphQLSchema, parse} from 'graphql';
import {CompiledOperation, CompileOptions, DisplayType} from './types';
import {getFileContent, write} from './fs';
import {
  parseTypeDefinitionNode,
  generateGQLOperation,
  generateTSTypeDefinition,
  getSorter,
  wrapWithWarning,
  parseOperation, toCamelCase, wrapAsDefaultExport,
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
    // flattenOperations = false,
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
    // flattenOperations,
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
    compileOperations(operationsString, outputDirectory, schema);
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
  write(wrapWithWarning(compiledTypes), outputDirectory, 'schema.d.ts');
  write(wrapAsDefaultExport(schemaString), outputDirectory, 'schema.js');

  return {
    schema,
  }
}

/**
 * Compiles operations
 * @param {string} operationsString
 * @param {string} outputDirectory
 * @param schema
 */
export function compileOperations(
  operationsString: string,
  outputDirectory: string,
  schema: GraphQLSchema,
  // flattenOperations: boolean,
) {
  const documentNode = parse(operationsString);
  const compiledTypes = documentNode
    .definitions
    .reduce<CompiledOperation[]>((acc, node) => {
      if (node.kind === 'OperationDefinition') {
        const {name, operation, loc} = node;
        const operationText = operationsString.slice(loc.start, loc.end);
        const ts = generateGQLOperation(parseOperation(node, schema));
        const js = `module.exports = \`${operationText}\`;`;

        acc.push({
          operationName: name.value + toCamelCase(operation),
          ts: wrapWithWarning(ts),
          js: wrapAsDefaultExport(js),
        });
      }
      return acc;
    }, []);

  // Write all the operations into a single file
  // if (flattenOperations) {
  //   const contents = compiledTypes.map(c => c.compiledText).join('\n\n');
  //   write(wrapWithWarning(contents), outputDirectory, 'operations.d.ts');
  // }
  // // Or create a new file for each query
  // else {
  compiledTypes.forEach(c => {
    write(c.ts, outputDirectory, `${c.operationName}.d.ts`);
    write(c.js, outputDirectory, `${c.operationName}.js`);
  });
  // }
}
