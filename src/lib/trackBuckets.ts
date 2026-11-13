/** Coarse item-count bucket for analytics (never exact numbers). */
export function itemCountBucket(n: number): string {
  if (n <= 20) return '1-20';
  if (n <= 100) return '21-100';
  if (n <= 500) return '101-500';
  return '500+';
}

/** Short reason code for an unsupported file; never the file content. */
export function unsupportedCode(messages: string[]): string {
  return messages.length > 1 ? 'multiple' : 'unsupported';
}
