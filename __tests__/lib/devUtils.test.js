import {
  formatJSON,
  minifyJSON,
  validateJSON,
  encodeBase64,
  decodeBase64,
  generateUUID,
  generateMultipleUUIDs,
} from '../../app/lib/devUtils';

describe('Developer Utilities', () => {
  describe('JSON Formatter', () => {
    test('formatJSON formats JSON with indentation', () => {
      const input = '{"name":"test","value":123}';
      const output = formatJSON(input);
      expect(output).toContain('"name": "test"');
      expect(output).toContain('\n');
    });

    test('formatJSON handles nested objects', () => {
      const input = '{"outer":{"inner":"value"}}';
      const output = formatJSON(input);
      expect(output).toContain('"outer":');
      expect(output).toContain('"inner": "value"');
    });

    test('formatJSON returns error for invalid JSON', () => {
      const input = '{"invalid json';
      expect(() => formatJSON(input)).toThrow();
    });

    test('minifyJSON removes whitespace', () => {
      const input = '{\n  "name": "test",\n  "value": 123\n}';
      const output = minifyJSON(input);
      expect(output).not.toContain('\n');
      expect(output).not.toContain('  ');
      expect(output).toBe('{"name":"test","value":123}');
    });

    test('validateJSON returns true for valid JSON', () => {
      expect(validateJSON('{"valid": true}')).toBe(true);
      expect(validateJSON('[]')).toBe(true);
      expect(validateJSON('123')).toBe(true);
      expect(validateJSON('"string"')).toBe(true);
    });

    test('validateJSON returns false for invalid JSON', () => {
      expect(validateJSON('{"invalid')).toBe(false);
      expect(validateJSON('{name: "test"}')).toBe(false);
      expect(validateJSON('')).toBe(false);
    });
  });

  describe('Base64 Tool', () => {
    test('encodeBase64 encodes text correctly', () => {
      expect(encodeBase64('Hello')).toBe('SGVsbG8=');
      expect(encodeBase64('Hello World!')).toBe('SGVsbG8gV29ybGQh');
      expect(encodeBase64('')).toBe('');
    });

    test('decodeBase64 decodes text correctly', () => {
      expect(decodeBase64('SGVsbG8=')).toBe('Hello');
      expect(decodeBase64('SGVsbG8gV29ybGQh')).toBe('Hello World!');
      expect(decodeBase64('')).toBe('');
    });

    test('decodeBase64 throws error for invalid base64', () => {
      expect(() => decodeBase64('!!!invalid!!!')).toThrow();
    });

    test('encode and decode are reversible', () => {
      const original = 'Test string with special chars: !@#$%^&*()';
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
    });

    test('handles unicode characters', () => {
      const unicode = 'Hello 世界 🌍';
      const encoded = encodeBase64(unicode);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(unicode);
    });
  });

  describe('UUID Generator', () => {
    test('generateUUID returns valid UUID format', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    test('generateUUID returns unique values', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    test('generateMultipleUUIDs returns correct count', () => {
      const uuids = generateMultipleUUIDs(5);
      expect(uuids).toHaveLength(5);
      uuids.forEach(uuid => {
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      });
    });

    test('generateMultipleUUIDs returns unique values', () => {
      const uuids = generateMultipleUUIDs(100);
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(100);
    });

    test('generateMultipleUUIDs returns empty array for zero count', () => {
      const uuids = generateMultipleUUIDs(0);
      expect(uuids).toHaveLength(0);
    });

    test('generateMultipleUUIDs handles large counts', () => {
      const uuids = generateMultipleUUIDs(1000);
      expect(uuids).toHaveLength(1000);
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(1000);
    });
  });
});
