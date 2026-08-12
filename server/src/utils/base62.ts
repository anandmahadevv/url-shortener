const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Encodes a numeric ID (number or bigint) to a Base62 string.
 * @param id Non-negative integer ID
 * @returns Base62 encoded string
 */
export function encodeBase62(id: number | bigint): string {
  let num = BigInt(id);
  
  if (num < 0n) {
    throw new Error('ID must be a non-negative integer');
  }

  if (num === 0n) {
    return BASE62_CHARS[0];
  }

  let result = '';
  while (num > 0n) {
    const remainder = Number(num % 62n);
    result = BASE62_CHARS[remainder] + result;
    num = num / 62n;
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

  return result;
}
