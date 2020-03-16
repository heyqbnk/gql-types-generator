import glob from 'glob';
import * as fs from 'fs';

const cwd = process.cwd();

/**
 * Adds current working directory to path
 * @param {string} path
 * @returns {string}
 */
export function withCwd(path: string): string {
  return path.startsWith('/')
    ? cwd + path
    : cwd + '/' + path;
}

/**
 * Returns paths to files which compares passed pattern
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
export async function withCwdAndGlob(pattern: string): Promise<string[]> {
  const patterns = pattern.split(',').map(withCwd).join(',');

  return new Promise((res, rej) => {
    glob(patterns, (err, matches) => {
      if (err) {
        return rej(err);
      }
      res(matches);
    });
  });
}

/**
 * Returns content of files found with passed glob
 * @returns {Promise<string>}
 * @param path
 */
export async function getFileContent(path: string | string[]): Promise<string> {
  const paths = Array.isArray(path) ? path : [path];

  return paths.reduce((acc, p) => acc + fs.readFileSync(p).toString(), '');
}

/**
 * Writes file with passed content
 * @param {string} path
 * @param {string} content
 */
export function writeFile(path: string, content: string) {
  return fs.writeFileSync(path, content);
}
