/**
 * Truncate string if it's longer than 8192 chars
 *
 * @param string - The stack trace to truncate
 * @param maxLength - The maximum length of the truncated string. Default = 8192
 * @returns The truncated string
 */
export function truncateString(string?: string, maxLength: number = 8192): string | undefined {
  if (string && string.length > maxLength) {
    const truncatedString = string.substring(0, maxLength);
    return truncatedString;
  }

  return string;
}
