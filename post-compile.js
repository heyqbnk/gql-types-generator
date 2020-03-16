const fs = require('fs');
const path = require('path');
const cliFilePath = path.resolve(__dirname, 'dist', 'cli.js');

const cliFileContent = fs.readFileSync(cliFilePath);
fs.writeFileSync(cliFilePath, '#!/usr/bin/env node\n' + cliFileContent);
