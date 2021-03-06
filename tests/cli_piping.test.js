const { readFileSync } = require('fs');
const path = require('path');

const run = require('./helpers/run');
const CLI = require('./constants/cli');
const CLI_MAN = require('./constants/cli_man');
const CLI_VERSION = require('./constants/cli_version');

const JS_INPUT_FILE = path.resolve(__dirname, './input/js/input.js');
const readJsOutputFile = (file) => {
  return readFileSync(path.resolve(__dirname, `./input/js/output/${file}.js`), {
    encoding: 'utf-8',
  });
};

testData = [
  {
    file: JS_INPUT_FILE,
    stdout: readJsOutputFile('all_comments_removed'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-block'],
    stdout: readJsOutputFile('keep_block_comments'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-line'],
    stdout: readJsOutputFile('keep_line_comments'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-protected'],
    stdout: readJsOutputFile('keep_protected_comments'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-block', '--keep-protected'],
    stdout: readJsOutputFile('keep_block_and_protected_comments'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-line', '--keep-protected'],
    stdout: readJsOutputFile('keep_line_and_protected_comments'),
  },
  {
    file: JS_INPUT_FILE,
    options: ['--keep-line', '--keep-block'],
    stdout: readJsOutputFile('no_comments_removed'),
  },
  {
    // Should ignore everything else if "--help" is present
    file: JS_INPUT_FILE,
    options: ['--keep-line', '--keep-block', '--help', '--version'],
    stdout: CLI_MAN,
  },
  {
    // Should ignore everything else (assuming "--help" is not present) if
    // "--version" is present
    file: JS_INPUT_FILE,
    options: ['--keep-line', '--keep-block', '--version'],
    stdout: CLI_VERSION,
  },
];

describe('piping data', () => {
  testData.forEach(({ file, options, stdout }) => {
    const cmd = `cat ${file} | ${CLI} ${(options || []).join(' ').trim()}`;

    test(cmd, async () => {
      const result = await run(cmd);
      expect(result.error).toBeNull();
      expect(result.stdout).toBe(stdout);
      expect(result.stderr).toBe('');
    });
  });
});
