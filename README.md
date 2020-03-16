gql-types-generator
===

[![NPM version][npm-image]][npm-url]
![Dependencies][deps-image]
![Size][size-image]
![Version][version-image]

[deps-image]: https://img.shields.io/david/wolframdeus/gql-types-generator
[npm-image]: https://img.shields.io/npm/dm/gql-types-generator
[npm-url]: https://www.npmjs.com/package/gql-types-generator
[size-image]: https://img.shields.io/bundlephobia/minzip/gql-types-generator
[version-image]: https://img.shields.io/npm/v/gql-types-generator

Package to generate types depending on GraphQL scheme, mutations and queries.

## Install
```
npm install --save gql-types-generator
```
```
yarn add gql-types-generator
```

## Usage
`gql-types-generator` provides 2 ways of generating types:
1. Command line interface;
2. TypeScript / JavaScript code.

### Command line interface
After installation of package is done, `gql-types-generator` command
becomes available.

```bash
Usage: gql-types-generator [options] <schema-globs>

Options:
  --sort <sort>         how to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema
  --output-path <path>  path to file where typings will be saved
  -h, --help            display help for command
```

### Programmatic control

If needed, you can use `compile` function to generate types.

```typescript
import {compile} from 'gql-types-generator';
import * as path from 'path';

compile({
  source: [
    path.resolve(__dirname, 'schema-artifacts-folder-1/*.graphql'),
    path.resolve(__dirname, 'schema-artifacts-folder-2/*.graphql')
  ],
  outputPath: path.resolve(__dirname, 'types.d.ts'),
  sort: 'as-is',
});

// OR

compile({
  source: path.resolve(__dirname, 'schema-artifacts/*.graphql'),
  outputPath: path.resolve(__dirname, 'types.d.ts'),
  sort: 'default',
});

// OR

compile({
  // You can pass gql schema directly 
  schema: 'type Query { ... }',
  outputPath: path.resolve(__dirname, 'types.d.ts'),
});
``` 
