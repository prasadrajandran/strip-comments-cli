const run = require('./helpers/run');
const CLI = require('./constants/cli');
const CLI_MAN = require('./constants/cli_man');
const CLI_VERSION = require('./constants/cli_version');

const testData = [
  {
    cmd: `${CLI} --help`,
    stdout: CLI_MAN,
    stderr: '',
  },
  {
    cmd: `${CLI} --version`,
    stdout: CLI_VERSION,
    stderr: '',
  },
  {
    // If help is present, it should ignore all other args
    cmd: `${CLI} --version --help somefile`,
    stdout: CLI_MAN,
    stderr: '',
  },
  {
    // If version is present and help is not, it should ignore all other
    // args
    cmd: `${CLI} --version somefile`,
    stdout: CLI_VERSION,
    stderr: '',
  },
];

describe('--help, --version', () => {
  testData.forEach(({ cmd, stderr, stdout }) => {
    test(cmd, async () => {
      const result = await run(cmd);
      expect(result.error).toBeNull();
      expect(result.stdout).toBe(stdout);
      expect(result.stderr).toBe(stderr);
    });
  });
});
