/**
 * Way of sorting types
 */
export type DisplayType = 'as-is' | 'default';

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
  /**
   * Full path to output directory
   */
  outputDirectory: string;
  /**
   * Should library remove descriptions
   */
  removeDescription?: boolean;
  /**
   * Types display order
   */
  display?: DisplayType;
  /**
   * Path(s) to schema
   */
  schemaPath: PathType;
  /**
   * Path(s) to operations
   */
  operationsPath?: PathType;
}

/**
 * Represents compiled operation
 */
export interface CompiledOperation {
  operationName: string;
  js: string;
  ts: string;
}
