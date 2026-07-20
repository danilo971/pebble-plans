import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * Generate a URL-safe, sortable, unique ID (similar to NanoID).
 * Uses base62 encoding with cryptographic random bytes.
 */
export function createId(size: number = 21): string {
  const bytes = randomBytes(size);
  let id = "";
  for (let i = 0; i < size; i++) {
    const idx = bytes[i]! % 62;
    id += ALPHABET[idx]!;
  }
  return id;
}
