/**
 * Splits a string into chunk sizes
 */
export function chunkString(str: string, length: number): string[] {
  return str.match(new RegExp(".{1," + length + "}", "g"));
}
