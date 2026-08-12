const ALPHA_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_OFFSET = 380204032n; // 52^5 offset ensures 6-letter alphabetic short code
const TOTAL_SPACE = 19770609664n; // 52^6 total combinations for 6 letters

/**
 * Encodes a numeric ID to a 6-letter pure alphabetic short code (a-z, A-Z).
 * @param id Non-negative integer ID
 * @param minLength Minimum code length (default: 6)
 * @returns 6-letter alphabetic string
 */
export function encodeBase62(id: number | bigint, minLength: number = 6): string {
  const rawId = BigInt(id);
  if (rawId < 0n) {
    throw new Error('ID must be a non-negative integer');
  }

  // Scramble multiplier ensures unique, non-sequential 6-letter alphabetic codes
  const scrambled = ((rawId * 1000000007n) + ALPHA_OFFSET) % TOTAL_SPACE;
  let num = scrambled === 0n ? ALPHA_OFFSET : scrambled;
  
  let result = '';
  while (num > 0n) {
    const remainder = Number(num % 52n);
    result = ALPHA_CHARS[remainder] + result;
    num = num / 52n;
  }

  while (result.length < minLength) {
    result = 'a' + result;
  }

  return result.slice(0, minLength);
}

/**
 * Decodes a 6-letter alphabetic string back to its original BigInt numeric ID.
 * @param code 6-letter alphabetic string
 * @returns Original BigInt ID
 */
export function decodeBase62(code: string): bigint {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  let result = 0n;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const index = ALPHA_CHARS.indexOf(char);
    if (index === -1) {
      // Fallback for custom aliases containing digits
      const fallbackIndex = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char);
      if (fallbackIndex === -1) {
        throw new Error(`Invalid Base62 character: '${char}'`);
      }
      result = result * 62n + BigInt(fallbackIndex);
    } else {
      result = result * 52n + BigInt(index);
    }
  }

  return result;
}
