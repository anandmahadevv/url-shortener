import { describe, it, expect } from 'vitest';
import { encodeBase62, decodeBase62 } from '../src/utils/base62';

describe('Base62 Encoding and Decoding', () => {
  it('should correctly encode basic numbers', () => {
    expect(encodeBase62(0)).toBe('0');
    expect(encodeBase62(1)).toBe('1');
    expect(encodeBase62(9)).toBe('9');
    expect(encodeBase62(10)).toBe('a');
    expect(encodeBase62(35)).toBe('z');
    expect(encodeBase62(36)).toBe('A');
    expect(encodeBase62(61)).toBe('Z');
    expect(encodeBase62(62)).toBe('10');
  });

  it('should correctly decode basic Base62 strings', () => {
    expect(decodeBase62('0')).toBe(0n);
    expect(decodeBase62('1')).toBe(1n);
    expect(decodeBase62('a')).toBe(10n);
    expect(decodeBase62('z')).toBe(35n);
    expect(decodeBase62('A')).toBe(36n);
    expect(decodeBase62('Z')).toBe(61n);
    expect(decodeBase62('10')).toBe(62n);
  });

  it('should successfully roundtrip encode and decode large IDs', () => {
    const testIds = [1n, 12345n, 99999999999n, 1000000000000000n];
    for (const id of testIds) {
      const encoded = encodeBase62(id);
      const decoded = decodeBase62(encoded);
      expect(decoded).toBe(id);
    }
  });

  it('should throw an error for invalid characters when decoding', () => {
    expect(() => decodeBase62('abc!')).toThrow("Invalid Base62 character: '!'");
    expect(() => decodeBase62('hello world')).toThrow("Invalid Base62 character: ' '");
  });

  it('should throw an error for negative numbers when encoding', () => {
    expect(() => encodeBase62(-5)).toThrow('ID must be a non-negative integer');
  });
});
