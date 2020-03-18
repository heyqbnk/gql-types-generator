/**
 * Way of sorting types
 */
export type DisplayType = 'as-is' | 'default';

export interface CompileGlob {
  cwd: string;
  globs: string | string[];
}

/**
 * Shared compile function options
 */
export interface CompileOptionsShared {
  /**
   * Full path to output directory
   */
  outputDirectory: string;
  /**
   * Should we remove descriptions
   */
  removeDescription?: boolean;
  /**
   * Types display order
   */
  display?: DisplayType;
}

/**
 * Compiles schema with path to file(s)
 */
export interface CompileSchemaWithFile {
  schemaPath: string | string[];
}

/**
 * Compiles schema with its text representation
 */
export interface CompileSchemaWithText {
  schema: string;
}

/**
 * Compiles schema with file(s) found with glob
 */
export interface CompileSchemaWithGlob {
  schemaGlobs: CompileGlob;
}

/**
 * Compiles operations with their text representation
 */
export interface CompileOperationsWithFile {
  operationsPath: string | string[];
}

/**
 * Compiles operations with its text representation
 */
export interface CompileOperationsWithText {
  operations: string;
}

/**
 * Compiles operations with file(s) found with glob
 */
export interface CompileOperationsWithGlob {
  operationsGlobs: CompileGlob;
}

/**
 * Possible compile options
 */
export type CompileOptions = CompileOptionsShared & (
  | CompileSchemaWithFile
  | CompileSchemaWithText
  | CompileSchemaWithGlob
  ) & (
  | CompileOperationsWithFile
  | CompileOperationsWithText
  | CompileOperationsWithGlob
  | {}
  );

/**
 * Represents compiled operation
 */
export interface CompiledOperation {
  operationName: string;
  js: string;
  ts: string;
}
