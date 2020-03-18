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

```
Usage: gql-types-generator [options] <schema-globs>

Options:
  --operations <globs>       globs to find queries and mutations
  --remove-description       states if description should be removed
  --display <sort>           how to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema
  --output-directory <path>  path to directory where typings will be saved
  -h, --help                 display help for command
```

> **Warning**
>
> When using CLI, each glob will be formatted as process.cwd() + glob. You can
> pass an array of globs using comma between them like 
> `src/schema1.graphql,src/schema2.graphql`

### Programmatic control
Library provides such functions as `compile`, `compileSchema` and 
`compileOperations` to generate types.

---

#### `compile`
##### List of available options

| Name | Type | Description |
|---|---|---|
| `outputDirectory` | `string` | Full path to output directory |
| `removeDescription` | `boolean?` | Should library remove descriptions |
| `display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |
| `schemaPath` | `PathType` | Defines paths to schema. Watch [possible values](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compiler.ts#L23-L26) for more |
| `operationsPath` | `PathType?` | Defines paths to operations. Watch [possible values](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compiler.ts#L23-L26) for more |

##### Example
```typescript
import {compile} from 'gql-types-generator';
import * as path from 'path';

compile({
  outputDirectory:  path.resolve(__dirname, 'compiled'),
  removeDescription: false,
  display: 'as-is',
  operationsPath: {
    glob: {
      cwd: process.cwd(),
      glob: 'gql/operations/*.graphql'
    }
  },
  schemaPath: {
    path: [
      path.resolve(__dirname, 'gql/schema/part1.graphql'),
      path.resolve(__dirname, 'gql/schema/part2.graphql'),
     ]
  },
  // Or pass schema glob
  schemaPath: {
    glob: {
      cwd: process.cwd(),
      glob: 'gql/schema/*.graphql'
    }
  },
  // Or pass schema definition directly
  schemaPath: {
    definition: 'type Query { ... }'
  }
});
```

---

#### `compileSchema(schemaString, outputDirectory, includeDescription?, display?)`
##### List of available options

| Name | Type | Description |
|---|---|---|
| `schemaString` | `string` | Schema definition |
| `outputDirectory` | `string` | Full path to output directory |
| `includeDescription` | `boolean?` | Should library include descriptions |
| `display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |

##### Example
```typescript
import {compileSchema} from 'gql-types-generator';
import * as path from 'path';

compileSchema(
  'type Query { ... }',
  path.resolve(__dirname, 'gql/compiled'),
  true,
  'default',
);
```

---

#### `compileOperations(schemaString, outputDirectory, includeDescription?, display?)`
##### List of available options

| Name | Type | Description |
|---|---|---|
| `operationsString` | `string` | Operations definition |
| `outputDirectory` | `string` | Full path to output directory |
| `schema` | `GraphQLSchema` | Built GQL schema |

##### Example
```typescript
import {compileOperations} from 'gql-types-generator';
import * as path from 'path';

compileOperations(
  'query getUser() { ... } mutation register() { ... }',
  path.resolve(__dirname, 'gql/compiled'),
  // We can get this value via compileSchema
  gqlSchema,
);
```
