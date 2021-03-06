const cliPackage = require('../../package.json');
const depPackage = require('strip-comments/package');

/**
 * CLI version information.
 */
const CLI_VERSION =
  `${depPackage.name}: ${depPackage.version}\n` +
  `${cliPackage.name}: ${cliPackage.version}\n`;

module.exports = CLI_VERSION;
