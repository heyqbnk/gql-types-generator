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

Currently supported GraphQL entities: `type`, `interface`, `input`,
`type and interface fields arguments`, `operations` (of any kind and selections).

GraphQL entities to be supported in near future: `fragments`, `inline fragments`,
`directives`.

> TLDR;
>
> If you dont want to read a lot of text and documentation, try to compile 
> your scheme and look what happens. You can find an example
> [here](https://github.com/wolframdeus/gql-types-generator/blob/master/example).
> Just use command in `command` file.

## Install
```
npm install --save gql-types-generator
```
```
yarn add gql-types-generator
```

## Usage
### Command line interface
After installation of package is done, `gql-types-generator` command
becomes available. Type to get help:
```bash
$ gql-types-generator --help
Usage: gql-types-generator [options] <schema-globs>

Options:
  --operations <globs>             globs to find queries and mutations
  --operations-file <filename>     operations file name. If passed, all operations will be placed into a single file
  --operations-wrap                wraps operations with graphql-tag, making exports from operations not strings, but graphql's DocumentNode (default: false)
  --operations-selection-separate  creates separated types for each selection set (default: false)
  --schema-file <filename>         schema file name
  --remove-description             states if description should be removed (default: false)
  --display <sort>                 how to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema
                                   (default: "default")
  --scalars <scalars>              defines scalars types. Must be a JSON, where key is scalar name and value is its type
  --output-directory <path>        path to directory where typings will be saved
  -h, --help                       display help for command
```

When using CLI, each glob will be formatted as `process.cwd()` + glob. You can
pass an array of globs using comma between them like 
`src/schema1.graphql,src/schema2.graphql`.

If an error occurring during types compilation, library returns code 1.

### Programmatic control
Library provides such functions as `compile`, `compileSchema` and 
`compileOperations` to generate types. [Type definitions for
these functions](https://github.com/wolframdeus/gql-types-generator/blob/master/src/types/compilation.ts).

#### `compile(options: CompileOptions)`

| Name | Type | Description |
|---|---|---|
| `options.outputDirectory` | `string` | Full path to output directory |
| `options.removeDescription` | `boolean?` | Should library remove descriptions |
| `options.display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |
| `options.schemaPath` | `PathType` | Defines paths to schema |
| `options.operationsPath` | `PathType?` | Defines paths to operations |
| `options.schemaFileName` | `string?` | Defines schema file name. For example - `schema.ts` |
| `options.operationsFileName` | `string?` | Defines operations file name. For example - `operation.ts`. If passed, all operations will be placed into a single file |
| `options.operationsWrap` | `boolean?` | States of compiled types should be `graphql`s `DocumentNode` and not string |
| `options.scalars` | `ScalarsMap?` | Defines types of scalars |

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
  },
  operationsPath: {
    path: path.resolve(__dirname, 'gql/getUsers.graphql'),
  },
  schemaFileName: 'my-compiled-schema.ts',
  operationsFileName: 'my-compiled-operations.ts',
  operationsWrap: true,
  scalars: {
    MyCustomScalar: 'Date',
    AnotherScalar: 'number | string | Record<string, string>',
    AndAnotherOneScalar: '"string literal"',
  }
});
```

#### `compileSchema(options: CompileSchemaOptions)`

| Name | Type | Description |
|---|---|---|
| `options.schema` | `string` | Schema definition |
| `options.outputDirectory` | `string` | Full path to output directory |
| `options.fileName` | `string?` | Output schema file name |
| `options.display` | `DisplayType?` | How to display compiled types. Valid values are "as-is" and "default". By default, generator compiles scalars first, then enums, interfaces, inputs, unions and then types. "as-is" places types as they are placed in schema |
| `options.removeDescription` | `boolean?` | Should library remove descriptions |
| `options.scalars` | `ScalarsMap?` | Defines types of scalars |

##### Example
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

#### `compileOperations(options: CompileOperationsOptions)`

| Name | Type | Description |
|---|---|---|
| `options.operations` | `string` | Operations definition |
| `options.outputDirectory` | `string` | Full path to output directory |
| `options.schema` | `GraphQLSchema` | Built GQL schema |
| `options.schemaFileName` | `string` | Schema file name. Used to pass in relative imports if they are required |
| `options.removeDescription` | `boolean?` | Should library remove descriptions |
| `options.fileName` | `string?` | Output operations file name. If passed, all operations will be placed into a single file |
| `options.wrapWithTag` | `boolean?` | States of compiled types should be `graphql`s `DocumentNode` and not string |

##### Example
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
  wrapWithTag: false,
});
```

## Compilation result
### Schema
Command creates a directory on passed `--output-directory` path, generates 
`d.ts` definition file and compiled `js` code. Name of these files are taken
from `--schema-file` argument (`schema.ts` by default).
 
`d.ts` contains all schema types and by default exports constant `schema` 
which is a text representation of schema.

Each schema type definition consists of `interface` and `namespace` with the
same name. All interface fields refers to namespace fields. So, if you want
to get some `Query` field type you could use `Query['someField']` 
or `Query.SomeField`. They return the same thing. It is recommended
to use `Query.*`-like syntax for better experience.

If `--scalars` passed, compiled type of scalar will be taken from this map.
If scalar not found, it will be `any`. Must be a JSON with values of type
string or number.

### Operations
To compile operations, it is required to use `--operations` argument. This
values must be a glob which refers to files where operations are defined.

Library creates single file with name `--operations-file` if it is passed
or 2 separate files `d.ts` and `js` for each command with name computed as
`operationName + toCamelCase(operationType)` in directory on passed 
`--output-directory`. So, if operation was `query getUsers { ... }`, 
created files will be `getUsersQuery.d.ts` and `getUsersQuery.js`.

- `d.ts` exports selection and namespace with `Arguments` if they exist.
Additionally namespace contains subselections represented as other
namespaces
- `js` exports representation of operation

If `--operations-wrap` passed, wraps each operation string with `graphql-tag`
package making each operation not string, but `graphql`s `Document Node`.
Useful when you use these operations on frontend with Apollo client.

