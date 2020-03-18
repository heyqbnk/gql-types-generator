import glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as shell from 'shelljs';

/**
 * Adds current working directory to path
 * @param {string} path
 * @param cwd
 * @returns {string}
 */
export function withCwd(path: string, cwd = process.cwd()): string {
  return path.startsWith('/')
    ? cwd + path
    : cwd + '/' + path;
}

/**
 * Returns paths to files which compares passed pattern
 * @returns {Promise<string[]>}
 * @param globs
 * @param cwd
 */
export async function withCwdAndGlob(
  globs: string | string[],
  cwd = process.cwd()
): Promise<string[]> {
  const formattedGlobs = Array.isArray(globs) ? globs : [globs];
  const patterns = formattedGlobs.map(g => withCwd(g, cwd));

  const matches = await Promise.all(
    patterns.map(p => new Promise((res, rej) => {
      glob(p, (err, matches) => {
        if (err) {
          return rej(err);
        }
        res(matches);
      });
    })),
  );

  // Flatten and keep unique paths
  return matches.flat().reduce<string[]>((acc, p) => {
    if (!acc.includes(p)) {
      acc.push(p);
    }
    return acc;
  }, []);
}

/**
 * Returns content of files found with passed glob or globs
 * @returns {Promise<string>}
 * @param path
 */
export async function getFileContent(path: string | string[]): Promise<string> {
  const paths = Array.isArray(path) ? path : [path];
  const contents = await Promise.all(
    paths.map(p => {
      return new Promise<string>((res, rej) => {
        fs.readFile(p, (err, data) => {
          if (err) {
            return rej(err);
          }
          res(data.toString());
        })
      })
    }),
  );

  return contents.reduce((acc, c) => acc + c, '');
}

/**
 * Writes file with passed content
 * @param directory
 * @param fileName
 * @param {string} content
 */
export async function write(content: string, directory: string, fileName: string) {
  await shell.mkdir('-p', directory);
  return fs.writeFileSync(path.resolve(directory, fileName), content);
}
