/**
 * Way of sorting types
 */
export type DisplayType = 'as-is' | 'default';

/**
 * Shared compile function options
 */
export interface CompileOptionsShared {
  /**
   * Globs to operations
   */
  operationsPath?: string | string[];
  /**
   * States if all operations should be
   */
  flattenOperations?: boolean;
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
 * Compile function options to compile file
 */
export interface CompileFileOptions extends CompileOptionsShared {
  /**
   * Globs to schema partials
   */
  schemaPath: string | string[];
}

/**
 * Compile function options to compile text
 */
export interface CompileTextOptions extends CompileOptionsShared {
  /**
   * Schema represented as text
   */
  schema: string;
}

/**
 * Possible compile options
 */
export type CompileOptions = CompileFileOptions | CompileTextOptions;

/**
 * Represents compiled operation
 */
export interface CompiledOperation {
  operationName: string;
  compiledText: string;
}
