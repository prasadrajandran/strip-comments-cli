const { readFileSync } = require('fs');
const path = require('path');

/**
 * CLI man page.
 */
const CLI_MAN = readFileSync(path.resolve(__dirname, '../../src/man.txt'), {
  encoding: 'utf-8',
});

module.exports = CLI_MAN;
