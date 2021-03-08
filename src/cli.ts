import { readFileSync, writeFileSync, existsSync } from 'fs';
import readline from 'readline';
import path from 'path';
import { performance } from 'perf_hooks';
import strip from 'strip-comments';
import { EOL } from 'os';
import { getopts } from '@prasadrajandran/getopts';
import { schema } from './cli_schema';
import man from './man.txt';
import {
  name as depPackageName,
  version as depPackageVersion,
} from 'strip-comments/package.json';
import {
  name as cliPackageName,
  version as cliPackageVersion,
} from '../package.json';
import { languageMapper } from './helpers/language_mapper';

(async () => {
  const { opts, args, errors } = getopts(schema);
  const encoding = 'utf-8';

  const print = (msg: string) => {
    if (msg[msg.length - 1] === '\n') {
      process.stdout.write(msg);
    } else {
      console.log(msg);
    }
  };

  const printHelp = () => {
    process.stdout.write(man);
  };

  const printError = (msg: string) => {
    console.error('\x1b[31m%s\x1b[0m', `stripcomments: ${msg}`);
  };

  // (1) HELP
  if (opts.has('--help')) {
    printHelp();
    return;
  }

  // (2) VERSION
  if (opts.has('--version')) {
    print(`${depPackageName}: ${depPackageVersion}`);
    print(`${cliPackageName}: ${cliPackageVersion}`);
    return;
  }

  // (3) CLI ERRORS
  if (errors.length) {
    const errorMessages = errors
      .map(({ name, message }) => `[${name}] ${message}`)
      .join(EOL);
    printError(`${EOL}${errorMessages}`);
    return;
  }

  // (4) STRIP COMMENTS
  interface StripOptions {
    keepProtected: boolean;
    preserveNewlines: boolean;
    language: string;
  }

  const { DATA_FROM_FILES, DATA_FROM_STDIN, STDIN_DATA } = (() => {
    if (args.length) {
      return { DATA_FROM_FILES: true, DATA_FROM_STDIN: false, STDIN_DATA: '' };
    } else {
      try {
        return {
          DATA_FROM_FILES: false,
          DATA_FROM_STDIN: true,
          STDIN_DATA: readFileSync(process.stdin.fd, { encoding }),
        };
      } catch (err) {
        return {
          DATA_FROM_FILES: false,
          DATA_FROM_STDIN: false,
          STDIN_DATA: '',
        };
      }
    }
  })();
  const WRITE_MODE = opts.has('-w') || opts.has('--write');
  const DRY_RUN = opts.has('--dry-run');
  const OVERWRITE_CONFIRMED = opts.has('--confirm-overwrite');
  const ONLY_FIRST = opts.has('--only-first');
  const KEEP_LINE = opts.has('--keep-line');
  const KEEP_BLOCK = opts.has('--keep-block');
  const OUTPUT_DIR = (opts.get('-o') || opts.get('--out-dir') || '') as string;
  const LANGUAGE_OPTION = (opts.get('--language') as string) || false;

  if (!DATA_FROM_FILES && !DATA_FROM_STDIN) {
    printError(`no FILE(s) specified...`);
    printHelp();
    return;
  }

  if (DATA_FROM_STDIN && WRITE_MODE) {
    printError(`-w cannot be activated if data is from STDIN`);
    return;
  }

  const getFileLanguage = (filename: string) => {
    // (1) Explicitly set
    if (LANGUAGE_OPTION) {
      return LANGUAGE_OPTION;
    }

    // (2) Attempt to infer from file extension
    if (DATA_FROM_FILES) {
      const extension = path.basename(filename).split('.')[1] || '';
      const language = languageMapper(extension);
      if (language) {
        return language;
      }
    }

    // (3) All attempts to determine the language have failed, just presume it's
    // JavaScript.
    return 'javascript';
  };

  let confirmOverwrite: ((query: string) => Promise<string>) | null = null;

  const stripComments = (() => {
    let fn = null;

    if (ONLY_FIRST) {
      fn = (input: string, sOpts: StripOptions) => strip.first(input, sOpts);
    } else if (!KEEP_LINE && !KEEP_BLOCK) {
      fn = (input: string, sOpts: StripOptions) => strip(input, sOpts);
    } else if (KEEP_LINE && !KEEP_BLOCK) {
      fn = (input: string, sOpts: StripOptions) => strip.block(input, sOpts);
    } else if (!KEEP_LINE && KEEP_BLOCK) {
      fn = (input: string, sOpts: StripOptions) => strip.line(input, sOpts);
    } else {
      fn = (input: string) => input;
    }

    return fn;
  })();

  const stripCommentsAndMeasureTimeTaken = (filename: string) => {
    const input = DATA_FROM_STDIN
      ? filename
      : readFileSync(filename, { encoding, flag: 'r' });

    const stripOptions: StripOptions = {
      keepProtected: opts.has('--keep-protected'),
      preserveNewlines: opts.has('--preserve-newlines'),
      language: getFileLanguage(filename),
    };

    let duration = performance.now();
    const data = stripComments(input, stripOptions);
    duration = performance.now() - duration;

    return {
      duration: `${duration.toFixed(2)}ms`,
      data,
      language: stripOptions.language,
    };
  };

  const processData = (() => {
    let fn = null;

    if (WRITE_MODE && DATA_FROM_FILES) {
      // WRITE TO FILES MODE
      fn = async (filename: string) => {
        const destinationFilename = OUTPUT_DIR
          ? path.join(OUTPUT_DIR, path.basename(filename))
          : filename;

        if (DRY_RUN) {
          if (filename === destinationFilename) {
            print(`${destinationFilename}`);
          } else {
            print(`${filename}, ${destinationFilename}`);
          }
        } else {
          const { duration, data } = stripCommentsAndMeasureTimeTaken(filename);

          const write = () => {
            writeFileSync(destinationFilename, data, {
              encoding,
              flag: 'w',
            });
            print(`${destinationFilename} ${duration}`);
          };

          if (confirmOverwrite && existsSync(destinationFilename)) {
            try {
              const answer = await confirmOverwrite(
                `Overwrite ${destinationFilename}? (y/N): `,
              );

              if (answer.match(/^y(es)?$/i)) {
                write();
              } else {
                print(`Skipped: ${filename}`);
              }
            } catch (err) {
              printError(err);
            }
          } else {
            write();
          }
        }
      };
    } else {
      // PRINT TO STDOUT MODE
      fn = async (filename: string) => {
        const { data } = stripCommentsAndMeasureTimeTaken(filename);
        print(data);
      };
    }

    return fn;
  })();

  if (DATA_FROM_FILES) {
    let prompt: readline.Interface | null = null;

    if (!DRY_RUN && WRITE_MODE && !OVERWRITE_CONFIRMED) {
      prompt = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      confirmOverwrite = (query: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            prompt.question(query, resolve);
          } catch (err) {
            reject(err);
          }
        });
      };
    }

    for (const filename of args as string[]) {
      await processData(filename);
    }

    if (prompt) {
      prompt.close();
    }
  } else if (DATA_FROM_STDIN) {
    processData(STDIN_DATA);
  }
})();
