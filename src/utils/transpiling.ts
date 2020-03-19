import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Transpiles TypeScript code
 * @param directory
 * @param {boolean} removeComments
 */
export function transpileDirectory(
  directory: string,
  removeComments: boolean,
) {
  const files = fs.readdirSync(directory).map(f => path.resolve(directory, f));
  const options: ts.CompilerOptions = {
    declaration: true,
    lib: ['esnext'],
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noUnusedLocals: true,
    noUnusedParameters: true,
    preserveConstEnums: true,
    removeComments,
    skipLibCheck: true,
    strict: true,
    strictNullChecks: false,
    target: ts.ScriptTarget.ES5,
  };

  // Transpile with typescript
  const program = ts.createProgram(files, options);
  program.emit();

  // Remove ts files
  files.forEach(f => fs.unlinkSync(f));
}
