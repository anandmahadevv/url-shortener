import { Request, Response, NextFunction } from 'express';

const RESERVED_ALIASES = new Set(['api', 'stats', '404', 'health', 'shorten', 'admin', 'dashboard', 'static', 'assets']);

/**
 * Validates a target URL string to ensure it is valid and safe.
 * Rejects non-HTTP/HTTPS protocols (e.g. javascript:, data:, file:) and malformed URLs.
 */
export function validateLongUrl(urlStr: string): { isValid: boolean; error?: string; cleanUrl?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { isValid: false, error: 'URL must be a non-empty string' };
  }

  const trimmedUrl = urlStr.trim();

  // Check for malicious scheme prefixes before parsing (handling cases like javascript:alert(1))
  const lowerUrl = trimmedUrl.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:') || lowerUrl.startsWith('file:')) {
    return { isValid: false, error: 'Blocked dangerous URL scheme (only http and https are allowed)' };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { isValid: false, error: `Protocol '${parsedUrl.protocol}' is not supported. Use http or https.` };
    }

    if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
      return { isValid: false, error: 'Invalid URL hostname' };
    }

    return { isValid: true, cleanUrl: parsedUrl.toString() };
  } catch (err) {
    return { isValid: false, error: 'Malformed URL provided. Please include http:// or https://' };
  }
}

/**
 * Validates custom alias format.
 */
export function validateCustomAlias(alias: string): { isValid: boolean; error?: string } {
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return { isValid: false, error: `'${alias}' is a reserved route name and cannot be used as a custom alias.` };
  }

  // Allow alphanumeric, hyphen, underscore; 2 to 50 chars
  const aliasRegex = /^[a-zA-Z0-9_-]{2,50}$/;
  if (!aliasRegex.test(alias)) {
    return { isValid: false, error: 'Custom alias must be 2-50 characters long and contain only letters, numbers, hyphens, or underscores.' };
  }

  return { isValid: true };
}
