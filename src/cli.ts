#!/usr/bin/env node
import {Command} from 'commander';
import {compile} from './compile';
import {getFilePaths} from './fs';
import {withCwd} from '../dist';

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
    'how to display compiled types. Valid values: "as-is" and "default"',
    parsePlacement,
  )
  .requiredOption('--output-path <path>', 'path to file where typings will be saved')
  .requiredOption('--schema-artifacts <globs>', 'glob used to find schema artifacts. These artifacts will be concatenated into the only 1 file and parsed by graphql package')
  .parse(process.argv);

(async () => {
  const source = await getFilePaths(program.schemaArtifacts);
  await compile({
    outputPath: withCwd(program.outputPath),
    source,
    sort: program.typesPlacement,
  });

  process.exit(0);
})();
