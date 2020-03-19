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

Package to generate TypeScript types depending on GraphQL scheme, mutations and 
queries.

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

## Command line interface
After installation of package is done, `gql-types-generator` command
becomes available.

```
Usage: gql-types-generator [options] <schema-globs>

Options:
  --operations <globs>          globs to find queries and mutations
  --operations-file <filename>  operations file name. If passed, all operations will be placed into a single file
  --schema-file <filename>      schema file name
  --remove-description          states if descriptions should be removed
  --display <sort>              how to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema
  --output-directory <path>     path to directory where typings will be saved
  -h, --help                    display help for command
```

When using CLI, each glob will be formatted as process.cwd() + glob. You can
pass an array of globs using comma between them like `src/schema1.graphql,src/schema2.graphql`

### Compilation result
As a result, command creates a directory on passed `--output-directory` path,
generates `d.ts` definition file and compiled `js` code:
 
- `d.ts` contains all schema types and by default exports constant `schema: string` 
which is a text representation of schema
- `js` exports by default text representation of schema

If `--operations` was passed, command is searching for operations and creates a
pair of `d.ts` and `js` files for each found operation. Name of each created
file depends on original operation name and its type. So, if operation was
`query getUsers { ... }`, created files will be `getUsersQuery.d.ts` and
`getUsersQuery.js`.

if `--operations-file` was passed, all files will be placed into a single file
with passed name.

- `d.ts` by default exports string which is a text representation of operation.
Additionally file contains types connected with operation. They can be:
    - Operation return type (for example, `GetUsersQuery`)
    - Operation variables type (for example, `GetUsersQueryVariables`)
- `js` exports by default text representation of operation 

## Programmatic control
Library provides such functions as `compile`, `compileSchema` and 
`compileOperations` to generate types.

---

### `compile(options: CompileOptions)`
#### List of available options

| Name | Type | Description |
|---|---|---|
| `options.outputDirectory` | `string` | Full path to output directory |
| `options.removeDescription` | `boolean?` | Should library remove descriptions |
| `options.display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |
| `options.schemaPath` | `PathType` | Defines paths to schema. Watch [possible values](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compilation.ts#L23-L26) for more |
| `options.operationsPath` | `PathType?` | Defines paths to operations. Watch [possible values](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compilation.ts#L23-L26) for more |
| `options.schemaFileName` | `string?` | Defines schema file name. For example - `schema.ts` |
| `options.operationsFileName` | `string?` | Defines operations file name. For example - `operation.ts`. If passed, all operations will be placed into a single file |

#### Example
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
  },
  operationsPath: {
    path: path.resolve(__dirname, 'gql/getUsers.graphql'),
  },
  schemaFileName: 'my-compiled-schema.ts',
  operationsFileName: 'my-compiled-operations.ts',
});
```

---

### `compileSchema(options: CompileSchemaOptions)`
#### List of available options

| Name | Type | Description |
|---|---|---|
| `options.schema` | `string` | Schema definition |
| `options.outputDirectory` | `string` | Full path to output directory |
| `options.fileName` | `string?` | Output schema file name |
| `options.display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |
| `options.removeDescription` | `boolean?` | Should library remove descriptions |

#### Example
```typescript
import {compileSchema} from 'gql-types-generator';
import * as path from 'path';

compileSchema({
  schema: 'type Query { ... }',
  outputDirectory: path.resolve(__dirname, 'gql/compiled'),
  fileName: 'my-compiled-schema.ts',
  display: 'default',
  removeDescription: true,
});
```

---

### `compileOperations(options: CompileOperationsOptions)`
#### List of available options

| Name | Type | Description |
|---|---|---|
| `operations` | `string` | Operations definition |
| `outputDirectory` | `string` | Full path to output directory |
| `schema` | `GraphQLSchema` | Built GQL schema |
| `schemaFileName` | `string` | Schema file name. Used to pass in relative imports if they are required |
| `removeDescription` | `boolean?` | Should library remove descriptions |
| `fileName` | `string?` | Output operations file name. If passed, all operations will be placed into a single file |

#### Example
```typescript
import {compileOperations} from 'gql-types-generator';
import * as path from 'path';

compileOperations({
  operations: 'query getUser() { ... } mutation register() { ... }',
  outputDirectory: path.resolve(__dirname, 'gql/compiled'),
  // We can get this value via compileSchema
  schema: gqlSchema,
  schemaFileName: 'my-compiled-schema.ts',
  removeDescription: true,
  fileName: 'my-compiled-operations.ts',
});
```
