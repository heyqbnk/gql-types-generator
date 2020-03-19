import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Transpiles TypeScript code
 * @param {string} tsCode
 * @param {string} outputDirectory
 * @param {string} fileName
 * @param {boolean} removeComments
 */
export function transpileTS(
  tsCode: string,
  outputDirectory: string,
  fileName: string,
  removeComments: boolean,
) {
  const filePath = path.resolve(outputDirectory, fileName);
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
  // Create TS original file with code
  fs.writeFileSync(filePath, tsCode);

  // Transpile with typescript
  const program = ts.createProgram([filePath], options);
  program.emit();

  // Remove original file
  fs.unlinkSync(filePath);
}
