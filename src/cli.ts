#!/usr/bin/env node
import {Command} from 'commander';
import {compile} from './compiler';
import {withCwd} from './fs';
import {Scalars} from './types';

const program = new Command('gql-types-generator');

program
  .option(
    '--operations <globs>',
    'globs to find queries and mutations',
  )
  .option(
    '--operations-file <filename>',
    'operations file name. If passed, all operations will be ' +
    'placed into a single file',
  )
  .option(
    '--operations-wrap',
    'wraps operations with graphql-tag, making exports from ' +
    'operations not strings, but graphql\'s DocumentNode',
    false,
  )
  .option(
    '--operations-selection-separate',
    'creates separated types for each selection set',
    false,
  )
  .option('--schema-file <filename>', 'schema file name')
  .option(
    '--remove-description',
    'states if description should be removed',
    false,
  )
  .option(
    '--display <sort>',
    'how to display compiled types. Valid values are "as-is" and ' +
    '"default". By default, generator compiles scalars first, then enums, ' +
    'interfaces, inputs, unions and then types. "as-is" places types as they ' +
    'are placed in schema',
    /(as-is)|(default)/,
    'default',
  )
  .option(
    '--scalars <scalars>',
    'defines scalars types. Must be a JSON, where key is scalar ' +
    'name and value is its type',
  )
  .requiredOption(
    '--output-directory <path>',
    'path to directory where typings will be saved',
  )
  .arguments('<schema-globs>')
  .action(async schemaPath => {
    const {
      operations, removeDescription, display, outputDirectory, operationsFile,
      schemaFile, operationsWrap, scalars,
    } = program;
    let scalarsParsed: Scalars = {};

    if (typeof scalars === 'string') {
      let error = false;

      try {
        scalarsParsed = JSON.parse(scalars);
        error = Object.values(scalarsParsed).some(v => {
          return typeof v !== 'string' && typeof v !== 'number';
        });
      } catch (e) {
        error = true;
      }

      if (error) {
        throw new Error(
          'Scalars has invalid format. It must be a map containing scalar ' +
          'names as keys and type definitions as values',
        )
      }
    }

    await compile({
      operationsPath: operations ? {
        glob: {
          cwd: process.cwd(),
          globs: operations.split(','),
        },
      } : null,
      operationsWrap,
      removeDescription,
      schemaPath: {
        glob: {
          cwd: process.cwd(),
          globs: schemaPath.split(','),
        },
      },
      display,
      outputDirectory: withCwd(outputDirectory),
      schemaFileName: schemaFile,
      operationsFileName: operationsFile,
      scalars: scalarsParsed,
    });
  })
  .parse(process.argv);
