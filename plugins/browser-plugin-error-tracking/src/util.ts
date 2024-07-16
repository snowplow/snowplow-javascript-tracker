/**
 * Truncate stack trace if it's size is greater than 8kb
 *
 * @param stackTrace - The stack trace to truncate
 * @returns The trucated stack trace
 */
export function truncateStackTrace(stackTrace?: string): string | undefined {
  const byteSize = (str: string) => new Blob([str]).size;

  if (stackTrace && byteSize(stackTrace) > 8000) {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(stackTrace);
    const truncatedEncodedText = encodedText.slice(0, 8000);
    const decoder = new TextDecoder();
    const truncatedStackTrace = decoder.decode(truncatedEncodedText);

    return truncatedStackTrace;
  }

  return stackTrace;
}
