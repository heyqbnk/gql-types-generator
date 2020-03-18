#!/usr/bin/env node
import {Command} from 'commander';
import {compile} from './compiler';
import {withCwdAndGlob} from './fs';
import {withCwd} from './fs';

const program = new Command('gql-types-generator');

function parseDisplayType(value: string) {
  const displays = ['as-is', 'default'];

  if (!displays.includes(value)) {
    throw new Error('Unknown display type');
  }
  return value;
}

program
  .option('--operations <globs>', 'globs to find queries and mutations')
  .option('--flatten-operations', 'states if operations should be placed in a single file')
  .option('--remove-description', 'states if description should be removed')
  .option(
    '--display <sort>',
    'how to display compiled types. Valid values are "as-is" and ' +
    '"default". By default, generator compiles scalars first, then enums, ' +
    'interfaces, inputs, unions and then types. "as-is" places types as they ' +
    'are placed in schema',
    parseDisplayType,
  )
  .requiredOption(
    '--output-directory <path>',
    'path to directory where typings will be saved',
  )
  .arguments('<schema-globs>')
  .action(async schemaPath => {
    const {
      operations, flattenOperations, removeDescription, display,
      outputDirectory,
    } = program;

    await compile({
      operationsPath: operations
        ? await withCwdAndGlob(operations) : null,
      flattenOperations,
      removeDescription,
      schemaPath: await withCwdAndGlob(schemaPath),
      display,
      outputDirectory: withCwd(outputDirectory),
    });
  })
  .parse(process.argv);
