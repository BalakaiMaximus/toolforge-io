import {
  countWords,
  countCharacters,
  countCharactersNoSpaces,
  countSentences,
  countParagraphs,
  estimateReadingTime,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
} from '../../app/lib/textUtils';

describe('Text Utilities', () => {
  describe('Word Counter', () => {
    test('countWords returns correct word count', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('  Multiple   spaces   between   words  ')).toBe(4);
      expect(countWords('')).toBe(0);
      expect(countWords('One')).toBe(1);
    });

    test('countCharacters returns correct character count', () => {
      expect(countCharacters('Hello')).toBe(5);
      expect(countCharacters('Hello World')).toBe(11);
      expect(countCharacters('')).toBe(0);
    });

    test('countCharactersNoSpaces returns correct count without spaces', () => {
      expect(countCharactersNoSpaces('Hello World')).toBe(10);
      expect(countCharactersNoSpaces('  spaces  ')).toBe(6);
      expect(countCharactersNoSpaces('')).toBe(0);
    });

    test('countSentences returns correct sentence count', () => {
      expect(countSentences('This is one sentence.')).toBe(1);
      expect(countSentences('First. Second. Third.')).toBe(3);
      expect(countSentences('No sentence ending')).toBe(1);
      expect(countSentences('')).toBe(0);
    });

    test('countParagraphs returns correct paragraph count', () => {
      expect(countParagraphs('One paragraph')).toBe(1);
      expect(countParagraphs('Para 1\n\nPara 2')).toBe(2);
      expect(countParagraphs('Para 1\n\n\n\nPara 2')).toBe(2);
      expect(countParagraphs('')).toBe(0);
    });

    test('estimateReadingTime returns correct reading time', () => {
      expect(estimateReadingTime(200)).toBe(1); // 200 words = 1 minute
      expect(estimateReadingTime(0)).toBe(0);
      expect(estimateReadingTime(400)).toBe(2);
    });
  });

  describe('Case Converter', () => {
    test('toUpperCase converts to uppercase', () => {
      expect(toUpperCase('hello world')).toBe('HELLO WORLD');
      expect(toUpperCase('Hello World')).toBe('HELLO WORLD');
      expect(toUpperCase('')).toBe('');
    });

    test('toLowerCase converts to lowercase', () => {
      expect(toLowerCase('HELLO WORLD')).toBe('hello world');
      expect(toLowerCase('Hello World')).toBe('hello world');
      expect(toLowerCase('')).toBe('');
    });

    test('toTitleCase converts to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    test('toSentenceCase converts to sentence case', () => {
      expect(toSentenceCase('hello world. this is a test.')).toBe('Hello world. This is a test.');
      expect(toSentenceCase('HELLO')).toBe('Hello');
    });

    test('toCamelCase converts to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('Hello World')).toBe('helloWorld');
      expect(toCamelCase('hello-world')).toBe('helloWorld');
    });

    test('toPascalCase converts to PascalCase', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
      expect(toPascalCase('hello_world')).toBe('HelloWorld');
    });

    test('toSnakeCase converts to snake_case', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
      expect(toSnakeCase('Hello World')).toBe('hello_world');
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
    });

    test('toKebabCase converts to kebab-case', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('Hello World')).toBe('hello-world');
      expect(toKebabCase('helloWorld')).toBe('hello-world');
    });
  });
});
