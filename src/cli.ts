const args = process.argv;
const globs = args[args.length - 1].split(',');
console.log(args);
console.log('Globs used to detect files: ' + globs.join(', '));
