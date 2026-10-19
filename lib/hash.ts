// A stable 32-bit hash (FNV-1a), for seeded orderings that must be the same
// on the server and in tests.
export function seededHash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
