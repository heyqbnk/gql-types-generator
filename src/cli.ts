#!/usr/bin/env node
import {Command} from 'commander';
import {compile} from './compiler';
import {withCwd} from './fs';

const program = new Command('gql-types-generator');

program
  .option('--operations <globs>', 'globs to find queries and mutations')
  .option('--operations-file <filename>', 'operations file name. If passed, all operations will be placed into a single file')
  .option('--schema-file <filename>', 'schema file name')
  .option('--remove-description', 'states if description should be removed')
  .option(
    '--display <sort>',
    'how to display compiled types. Valid values are "as-is" and ' +
    '"default". By default, generator compiles scalars first, then enums, ' +
    'interfaces, inputs, unions and then types. "as-is" places types as they ' +
    'are placed in schema',
    /(as-is)|(default)/,
  )
  .requiredOption(
    '--output-directory <path>',
    'path to directory where typings will be saved',
  )
  .arguments('<schema-globs>')
  .action(async schemaPath => {
    const {
      operations, removeDescription, display, outputDirectory, operationsFile,
      schemaFile,
    } = program;
    const operationsGlobs = operations ? {
      glob: {
        cwd: process.cwd(),
        globs: operations.split(','),
      },
    } : null;
    const schemaGlobs = {
      cwd: process.cwd(),
      globs: schemaPath.split(','),
    };
    console.log(schemaPath)

    await compile({
      operationsPath: operationsGlobs,
      removeDescription,
      schemaPath: {glob: schemaGlobs},
      display,
      outputDirectory: withCwd(outputDirectory),
      schemaFileName: schemaFile,
      operationsFileName: operationsFile,
    });
  })
  .parse(process.argv);
