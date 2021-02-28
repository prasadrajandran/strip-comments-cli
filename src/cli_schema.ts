import { lstatSync } from 'fs';
import path from 'path';
import { Schema } from '@prasadrajandran/getopts/dist/interfaces/schema';

const schema: Schema = {
  opts: [
    { longName: '--keep-line' },
    { longName: '--keep-block' },
    { longName: '--keep-protected' },
    { longName: '--preserve-newlines' },
    { name: '-w', longName: '--write' },
    { longName: '--dry-run' },
    {
      name: '-o',
      longName: '--out-dir',
      arg: 'required',
      argFilter: (v: string) => {
        const destinationDir = path.resolve(v);
        if (!lstatSync(destinationDir).isDirectory()) {
          throw new Error(`${destinationDir} is not a directory`);
        }
        return destinationDir;
      },
    },
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