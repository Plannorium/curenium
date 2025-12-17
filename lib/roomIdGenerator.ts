/**
 * Generates a unique room ID hash for channels
 * @param seed - String to base the hash on
 * @returns A base36 hash string of length 8
 */
export function generateRoomId(seed: string): string {
  if (!seed) throw new Error('Seed is required');
  // Create a simple hash of the seed for uniqueness
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Convert to base36 and take first 8 characters for brevity
  return Math.abs(hash).toString(36).substring(0, 8);
}