import { describe, it, expect } from 'vitest';
import { encodeBase62, decodeBase62 } from '../src/utils/base62';

describe('Base62 / Alphabetic 6-Letter Encoding', () => {
  it('should encode numeric IDs into 6-letter pure alphabetic strings', () => {
    const code1 = encodeBase62(1);
    const code2 = encodeBase62(2);
    
    expect(code1).toMatch(/^[a-zA-Z]{6}$/);
    expect(code2).toMatch(/^[a-zA-Z]{6}$/);
    expect(code1).not.toBe(code2);
    expect(code1.length).toBe(6);
    expect(code2.length).toBe(6);
  });

  it('should generate distinct 6-letter codes across sequential IDs', () => {
    const set = new Set();
    for (let i = 1; i <= 100; i++) {
      const code = encodeBase62(i);
      expect(code).toMatch(/^[a-zA-Z]{6}$/);
      expect(code.length).toBe(6);
      set.add(code);
    }
    expect(set.size).toBe(100);
  });

  it('should throw an error for invalid characters when decoding', () => {
    expect(() => decodeBase62('abc!')).toThrow("Invalid Base62 character: '!'");
    expect(() => decodeBase62('hello world')).toThrow("Invalid Base62 character: ' '");
  });

  it('should throw an error for negative numbers when encoding', () => {
    expect(() => encodeBase62(-5)).toThrow('ID must be a non-negative integer');
  });
});
