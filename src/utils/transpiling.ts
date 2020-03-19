import * as ts from 'typescript';
import * as fs from 'fs';
import {readdirSync} from 'fs';
import * as path from 'path';

/**
 * Transpiles TypeScript code
 * @param sourceDirectory
 * @param outputDirectory
 * @param {boolean} removeComments
 */
export function transpile(
  sourceDirectory: string,
  outputDirectory: string,
  removeComments: boolean,
) {
  const files = readdirSync(sourceDirectory).map(f => path.resolve(sourceDirectory, f));
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
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName, data) => {
    const name = path.parse(fileName).base;
    fs.writeFileSync(path.resolve(outputDirectory, name), data);
  };

  // Transpile with typescript
  const program = ts.createProgram(files, options, host);
  program.emit();
}
