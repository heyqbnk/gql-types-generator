#!/usr/bin/env node
import {Command} from 'commander';
import {compile} from './compile';
import {withCwdAndGlob} from './fs';
import {withCwd} from './fs';

const program = new Command('gql-types-generator');

function parsePlacement(value: string) {
  const placements = ['as-is', 'default'];

  if (!placements.includes(value)) {
    throw new Error('Unknown types placement');
  }
  return value;
}

program
  .option('--remove-description', 'states if we should remove description')
  .option(
    '-s --sort <sort>',
    'how to display compiled types. Valid values are "as-is" and ' +
    '"default". By default, generator compiles scalars first, then enums, ' +
    'interfaces, inputs, unions and then types. "as-is" places types as they ' +
    'are placed in schema',
    parsePlacement,
  )
  .requiredOption('-o --output-path <path>', 'path to file where typings will be saved')
  .arguments('<schema-globs>')
  .action(async globs => {
    await compile({
      removeDescription: 'removeDescription' in program,
      source: await withCwdAndGlob(globs),
      sort: program.sort,
      outputPath: withCwd(program.outputPath),
    });
  })
  .parse(process.argv);
