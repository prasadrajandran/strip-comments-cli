# strip-comments-cli

Strip comments from JavaScript files (and more). This is a CLI wrapper for
"strip-comments" by Jon Schlinkert. For a full list of supported languages,
please visit [strip-comments](https://github.com/jonschlinkert/strip-comments).

## Highlights

- Supports globbing patterns (via your shell)
  - `stripcomments ./dist/*.js ./src/*.ts`
- Supports piping
  - `cat source.js | stripcomments`
  - `cat source.js | stripcomments > source.stripped.js`
- Print results to stdin, overwrite the files, or write the files to a
  different directory:
  - `stripcomments ./src/source.js`
  - `stripcomments -w ./src/source.js`
  - `stripcomments -wo ./out ./src/source.js`

## How Do I Use It?

#### Globally

```Shell
npm i -g @prasadrajandran/strip-comments-cli
```

```Shell
stripcomments [OPTION]... [FILE/GLOB]...
```

#### Locally

```Shell
npm i @prasadrajandran/strip-comments-cli
```

###

```Shell
npx stripcomments [OPTION]... [FILE/GLOB]...
```

Note: this assumes that you're in the directory where the package is installed.

## Manual

Have a look at the [man](https://raw.githubusercontent.com/prasadrajandran/strip-comments-cli/main/man?token=ABORJ4I46XB7RMRUMMMRMRTAHPG4Q)
page for more information.
