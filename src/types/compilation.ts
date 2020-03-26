/**
 * Way of sorting types
 */
import {GraphQLSchema} from 'graphql';

/**
 * Compiled types sorting
 */
export type DisplayType = 'as-is' | 'default';

/**
 * Scalars map
 */
export interface ScalarsMap {
  [name: string]: string | number;
}

/**
 * Configuration for globs
 */
export interface GlobConfig {
  /**
   * Base working directory to search from
   */
  cwd: string;
  /**
   * Globs to find files
   */
  globs: string | string[];
}

/**
 * Defines ways path can be defined
 */
export type PathType =
  | { path: string | string[] }
  | { definition: string }
  | { glob: GlobConfig };

/**
 * Shared compile function options
 */
export interface CompileOptions {
  outputDirectory: string;
  removeDescription?: boolean;
  display?: DisplayType;
  schemaPath: PathType;
  operationsPath?: PathType;
  schemaFileName?: string;
  operationsFileName?: string;
  operationsWrap?: boolean;
  scalars?: ScalarsMap;
}

/**
 * Represents compiled operation
 */
export interface CompiledOperation {
  operationName: string;
  ts: string;
}

/**
 * Options to compile schema
 */
export interface CompileSchemaOptions {
  schema: string;
  outputDirectory: string;
  fileName?: string;
  display?: DisplayType;
  removeDescription?: boolean;
  scalars?: ScalarsMap;
}

/**
 * Options to compile operations
 */
export interface CompileOperationsOptions {
  operations: string;
  outputDirectory: string;
  schema: GraphQLSchema;
  schemaFileName: string;
  wrapWithTag?: boolean;
  removeDescription?: boolean;
  fileName?: string;
}
