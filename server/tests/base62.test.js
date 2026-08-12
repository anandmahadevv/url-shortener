"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const base62_1 = require("../src/utils/base62");
(0, vitest_1.describe)('Base62 / Alphabetic 6-Letter Encoding', () => {
    (0, vitest_1.it)('should encode numeric IDs into 6-letter pure alphabetic strings', () => {
        const code1 = (0, base62_1.encodeBase62)(1);
        const code2 = (0, base62_1.encodeBase62)(2);
        (0, vitest_1.expect)(code1).toMatch(/^[a-zA-Z]{6}$/);
        (0, vitest_1.expect)(code2).toMatch(/^[a-zA-Z]{6}$/);
        (0, vitest_1.expect)(code1).not.toBe(code2);
        (0, vitest_1.expect)(code1.length).toBe(6);
        (0, vitest_1.expect)(code2.length).toBe(6);
    });
    (0, vitest_1.it)('should generate distinct 6-letter codes across sequential IDs', () => {
        const set = new Set();
        for (let i = 1; i <= 100; i++) {
            const code = (0, base62_1.encodeBase62)(i);
            (0, vitest_1.expect)(code).toMatch(/^[a-zA-Z]{6}$/);
            (0, vitest_1.expect)(code.length).toBe(6);
            set.add(code);
        }
        (0, vitest_1.expect)(set.size).toBe(100);
    });
    (0, vitest_1.it)('should throw an error for invalid characters when decoding', () => {
        (0, vitest_1.expect)(() => (0, base62_1.decodeBase62)('abc!')).toThrow("Invalid Base62 character: '!'");
        (0, vitest_1.expect)(() => (0, base62_1.decodeBase62)('hello world')).toThrow("Invalid Base62 character: ' '");
    });
    (0, vitest_1.it)('should throw an error for negative numbers when encoding', () => {
        (0, vitest_1.expect)(() => (0, base62_1.encodeBase62)(-5)).toThrow('ID must be a non-negative integer');
    });
});
