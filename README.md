# strip-comments-cli

Strip comments from JavaScript, CSS, HTML, TypeScript, and more. This is a CLI
wrapper for
"[strip-comments](https://github.com/jonschlinkert/strip-comments#readme)" by
Jon Schlinkert.

## Highlights

- Supports globbing patterns (via your shell):
  - `stripcomments ./dist/*.js ./src/*.ts`
- Supports piping:
  - `cat source.js | stripcomments`
  - `cat source.js | stripcomments > source.stripped.js`
- Print results to stdin, overwrite the files, or write the files to a
  different directory:
  - `stripcomments ./src/source.js`
  - `stripcomments -w ./src/source.js`
  - `stripcomments -wo ./out ./src/source.js`

## How Do I Use It?

Have a look at the [man](https://raw.githubusercontent.com/prasadrajandran/strip-comments-cli/main/src/man.txt)
page for more information.

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


```Shell
npx stripcomments [OPTION]... [FILE/GLOB]...
```
