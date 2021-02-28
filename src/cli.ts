import { readFileSync, writeFileSync, existsSync } from 'fs';
import readline from 'readline';
import path from 'path';
import { performance } from 'perf_hooks';
import strip from 'strip-comments';
import { getopts } from '@prasadrajandran/getopts';
import { schema } from './cli_schema';

(async () => {
  const { opts, args, errors } = getopts(schema);
  const encoding = 'utf-8';

  const printHelp = () => {
    const man = readFileSync(path.resolve(__dirname, '../man'), {
      encoding,
      flag: 'r',
    });
    console.info(man);
  };

  // (1) HELP
  if (opts.has('--help')) {
    printHelp();
    return;
  }

  // (2) VERSION
  if (opts.has('--version')) {
    const cliPkg = JSON.parse(
      readFileSync(path.resolve(__dirname, '../package.json'), {
        encoding,
        flag: 'r',
      }),
    );

    const depPkg = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../node_modules/strip-comments/package.json'),
        {
          encoding: 'utf-8',
          flag: 'r',
        },
      ),
    );

    console.info(`${depPkg.name}: ${depPkg.version}`);
    console.info(`${cliPkg.name}: ${cliPkg.version}`);
    return;
  }

  // (3) CLI ERRORS
  if (errors.length) {
    console.error(
      'stripcomments:\n' +
        errors
          //@ts-ignore
          .map(({ name, message, argFilterError }) => {
            let errMsg = `${name}: ${message}`;
            if (argFilterError) {
              errMsg += `\n\t${argFilterError}`;
            }

            return errMsg;
          })
          .join('\n\n'),
    );
    return;
  }

  // (4) STRIP COMMENTS
  const writeMode = opts.has('-w') || opts.has('-write') || false;
  const dryRun = opts.has('--dry-run');
  const destinationDir = (opts.get('-o') ||
    opts.get('--out-dir') ||
    '') as string;
  const fromStdin = !args.length && !process.stdin.isTTY;
  let confirmOverwrite: ((query: string) => Promise<string>) | null = null;

  const stripComments = (() => {
    const keepLine = opts.has('--keep-line');
    const keepBlock = opts.has('--keep-block');
    const options = {
      keepProtected: opts.has('--keep-protected'),
      preserveNewlines: opts.has('--preserve-newlines'),
    };
    if (!keepLine && !keepBlock) {
      return (input: string) => strip(input, options);
    } else if (keepLine && !keepBlock) {
      return (input: string) => strip.block(input, options);
    } else if (!keepLine && keepBlock) {
      return (input: string) => strip.line(input, options);
    } else {
      return (input: string) => input;
    }
  })();

  const processData = (() => {
    const stripAndMeasureTimeTaken = (filename: string) => {
      const input = fromStdin
        ? filename
        : readFileSync(filename, { encoding, flag: 'r' });
      let duration = performance.now();
      const data = stripComments(input);
      duration = performance.now() - duration;
      return { duration: `${duration.toFixed(2)}ms`, data };
    };

    if (writeMode) {
      return async (filename: string) => {
        const destinationFilename = destinationDir
          ? path.join(destinationDir, path.basename(filename))
          : filename;

        if (dryRun) {
          if (filename === destinationFilename) {
            console.log(`${destinationFilename}`);
          } else {
            console.log(`${filename}, ${destinationFilename}`);
          }
        } else {
          const { duration, data } = stripAndMeasureTimeTaken(filename);

          const write = () => {
            writeFileSync(destinationFilename, data, {
              encoding,
              flag: 'w',
            });
            console.log(`${destinationFilename} ${duration}`);
          };

          if (confirmOverwrite && existsSync(destinationFilename)) {
            try {
              const answer = await confirmOverwrite(
                `Overwrite ${destinationFilename}? (y/N): `,
              );

              if (answer.match(/^y(es)?$/i)) {
                write();
              } else {
                console.log(`Skipped: ${filename}`);
              }
            } catch (err) {
              console.error(`stripcomments: ${err}`);
              return;
            }
          } else {
            write();
          }
        }
      };
    } else {
      return async (filename: string) => {
        console.log(stripAndMeasureTimeTaken(filename).data);
      };
    }
  })();

  if (fromStdin) {
    processData(readFileSync(process.stdin.fd, { encoding }));
  } else if (args.length) {
    let prompt: readline.Interface | null = null;

    if (!dryRun && writeMode) {
      prompt = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      confirmOverwrite = (query: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          try {
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
  } else {
    console.error('stripcomments: no FILE(s) specified...\n');
    printHelp();
  }
})();
