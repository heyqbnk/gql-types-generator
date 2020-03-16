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
  .option(
    '--sort <sort>',
    'how to display compiled types. Valid values are "as-is" and ' +
    '"default". By default, generator compiles scalars first, then enums, ' +
    'interfaces, inputs, unions and then types. "as-is" places types as they ' +
    'are placed in schema',
    parsePlacement,
  )
  .requiredOption('--output-path <path>', 'path to file where typings will be saved')
  .requiredOption('--schema-artifacts <globs>', 'glob used to find schema artifacts. These artifacts will be concatenated into the only 1 file and parsed by graphql package')
  .parse(process.argv);

(async () => {
  await compile({
    outputPath: withCwd(program.outputPath),
    source: await withCwdAndGlob(program.schemaArtifacts),
    sort: program.sort,
  });

  process.exit(0);
})();
