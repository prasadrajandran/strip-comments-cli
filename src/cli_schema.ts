import { lstatSync } from 'fs';
import path from 'path';
import { Schema } from '@prasadrajandran/getopts';
import { SUPPORTED_LANGUAGES, languageMapper } from './helpers/language_mapper';

const schema: Schema = {
  opts: [
    {
      longName: '--language',
      arg: 'required',
      argFilter: (input: string): string => {
        const language = languageMapper(input);
        if (language) {
          return language;
        }
        throw new Error(
          `"${input}" is not a supported language. ` +
            `Please use one of the following: ` +
            SUPPORTED_LANGUAGES.join(', '),
        );
      },
    },
    { longName: '--only-first' },
    { longName: '--keep-line' },
    { longName: '--keep-block' },
    { longName: '--keep-protected' },
    { longName: '--preserve-newlines' },
    { name: '-w', longName: '--write' },
    {
      name: '-o',
      longName: '--out-dir',
      arg: 'required',
      argFilter: (v: string): string => {
        const destinationDir = path.resolve(v);
        if (!lstatSync(destinationDir).isDirectory()) {
          throw new Error(`${destinationDir} is not a directory`);
        }
        return destinationDir;
      },
    },
    { longName: '--dry-run' },
    { longName: '--confirm-overwrite' },
    { longName: '--version' },
    { longName: '--help' },
  ],
  argFilter: (file: string) => {
    const filename = path.resolve(file);
    if (!lstatSync(filename).isFile()) {
      throw new Error(`${filename} is not a file`);
    }
    return filename;
  },
};

export { schema };
