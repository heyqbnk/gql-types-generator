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

> **Warning**
>
> When using CLI, each glob will be formatted as process.cwd() + glob.
>
> When using compile function directly through JS, it will not format any glob,
> so make sure you passed correct globs

### Command line interface
After installation of package is done, `gql-types-generator` command
becomes available.

```bash
Usage: gql-types-generator [options] <schema-globs>

Options:
  --operations <globs>       globs to find queries and mutations
  --remove-description       states if description should be removed
  --display <sort>           how to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema
  --output-directory <path>  path to directory where typings will be saved
  -h, --help                 display help for command
```

### Programmatic control
If needed, you can use `compile` function to generate types.

#### Options
[Current list of options](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compiler.ts)

#### Examples
When schema is separated between 2 directories:

```typescript
import {compile} from 'gql-types-generator';
import * as path from 'path';

compile({
  schemaPath: [
    path.resolve(__dirname, 'schema-artifacts-folder-1/schema-part.graphql'),
    path.resolve(__dirname, 'schema-artifacts-folder-2/schema-part.graphql')
  ],
  outputDirectory:  path.resolve(__dirname, 'compiled'),
});
```

When all the schema partials are in the only 1 directory:
```typescript
compile({
  schemaPath: path.resolve(__dirname, 'schema-artifacts/schema.graphql'),
  outputDirectory:  path.resolve(__dirname, 'compiled'),
});
```

When you already have schema as text:

```typescript
compile({ 
  schema: 'type Query { ... }',
  outputDirectory:  path.resolve(__dirname, 'compiled'),
});
``` 

When you want to sort schema types as they are placed in original GQL schema:
```typescript
compile({
  schemaPath: path.resolve(__dirname, 'schema-artifacts/*.graphql'),
  outputDirectory:  path.resolve(__dirname, 'compiled'),
  sort: 'as-is'
});
```

Getting schema partials with globs or glob
```typescript
compile({
  schemaGlobs: {
    cwd: process.cwd(),
    globs: '/schema-artifacts/*.graphql',
    // OR
    globs: [
      '/schema-artifacts-folder-1/*.graphql', 
      '/schema-artifacts-folder-2/*.graphql'
    ],
  },
  outputDirectory:  path.resolve(__dirname, 'compiled'),
  sort: 'as-is'
});
```
