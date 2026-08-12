const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE_OFFSET = 916132832n; // Guarantees 6-character short codes starting from ID 1 (e.g. 100001, 100002)

/**
 * Encodes a numeric ID (number or bigint) to a 6-character Base62 string.
 * @param id Non-negative integer ID
 * @param minLength Minimum code length (default: 6)
 * @returns Base62 encoded string of at least minLength
 */
export function encodeBase62(id: number | bigint, minLength: number = 6): string {
  const rawId = BigInt(id);
  if (rawId < 0n) {
    throw new Error('ID must be a non-negative integer');
  }

  let num = rawId + BASE_OFFSET;
  let result = '';
  while (num > 0n) {
    const remainder = Number(num % 62n);
    result = BASE62_CHARS[remainder] + result;
    num = num / 62n;
  }

  while (result.length < minLength) {
    result = '0' + result;
  }

  return result;
}

/**
 * Decodes a Base62 string back to its original BigInt numeric ID.
 * @param code Base62 encoded string
 * @returns Original BigInt ID
 */
export function decodeBase62(code: string): bigint {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  let result = 0n;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base62 character: '${char}'`);
    }
    result = result * 62n + BigInt(index);
  }

  return result >= BASE_OFFSET ? result - BASE_OFFSET : result;
}
