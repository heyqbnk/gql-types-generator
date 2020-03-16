import {Command} from 'commander';
import {compile} from './compile';
import {getFilePaths} from './fs';

const program = new Command('gql-types-generator');

program
  .requiredOption('-o --output-path <path>', 'path to file where typings will be saved')
  .requiredOption('-s --schema-artifacts <globs>', 'glob used to find schema artifacts. These artifacts will be concatenated into the only 1 file and parsed by graphql package')
  .parse(process.argv);

(async () => {
  const source = await getFilePaths(program.schemaArtifacts);
  const compiled = await compile({
    outputPath: program.outputPath,
    source,
  });

  console.log(compiled);

  process.exit(0);
})();
