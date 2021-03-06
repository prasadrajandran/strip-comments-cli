const { exec } = require('child_process');

/**
 * Execute a command.
 * @param {string} cmd Command to execute.
 * @returns {Promise<{
 *     error: null,
 *     stdout: string,
 *     stderr: string
 * }>}
 */
const run = (cmd) => {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

module.exports = run;
