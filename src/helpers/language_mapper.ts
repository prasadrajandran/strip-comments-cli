export const SUPPORTED_LANGUAGES = Object.freeze([
  'Ada',
  'APL',
  'AppleScript',
  'Haskell',
  'HTML',
  'JavaScript',
  'Lua',
  'MATLAB',
  'Perl',
  'PHP',
  'Python',
  'Ruby',
  'Shebang',
  'C',
  'C#',
  'CSS',
  'Java',
  'Less',
  'Sass',
  'Swift',
  'TypeScript',
  'Pascal',
  'OCaml',
  'XML',
]);

/**
 *
 * @param input -
 */
export const languageMapper = (input: string): string => {
  const language = input.toLowerCase();
  switch (language) {
    case 'ada':
    case 'apl':
    case 'applescript':
    case 'haskell':
    case 'html':
    case 'javascript':
    case 'lua':
    case 'matlab':
    case 'perl':
    case 'php':
    case 'python':
    case 'ruby':
    case 'shebang':
      return language;
    case 'c':
    case 'csharp':
    case 'c#':
    case 'css':
    case 'java':
    case 'less':
    case 'sass':
    case 'swift':
    case 'typescript':
      return 'javascript';
    case 'pascal':
    case 'ocaml':
      return 'applescript';
    case 'xml':
      return 'html';

    // File extensions
    case 'adb':
    case 'ads':
      return 'ada';
    case 'scpt':
    case 'scptd':
      return 'applescript';
    case 'hs':
    case 'lhs':
      return 'haskell';
    case 'm':
      return 'matlab';
    case 'pl':
      return 'perl';
    case 'py':
      return 'python';
    case 'rb':
      return 'ruby';
    case 'h': // C
    case 'cs': // C#
    case 'csx': // C#
    case 'scss': // Sass
    case 'js': // JavaScript
    case 'ts': // TypeScript
      return 'javascript';
    case 'pp': // Pascal
    case 'pas': // Pascal
    case 'ml': // OCaml
    case 'mli': // OCaml
      return 'applescript';
    default:
      return '';
  }
};
