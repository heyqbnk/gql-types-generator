import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export function transpileFile(
  filePath: string,
  removeComments: boolean,
) {
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
  const program = ts.createProgram([filePath], options);
  program.emit();
}

export function transpileWithFs(
  input: string,
  fileName: string,
  outputDirectory: string,
  removeDescription: boolean,
) {
  const filePath = path.resolve(outputDirectory, fileName);
  fs.writeFileSync(filePath, input);
  transpileFile(filePath, removeDescription);
  fs.unlinkSync(filePath);
}
