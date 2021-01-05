/**
 * Values based upon the user agents characteristics, typically requested via the ACCEPT-CH HTTP header, as defined in the HTTP Client Hint specification
 */
export interface HttpClientHints {
  [key: string]: unknown;
  /**
   * A boolean indicating if the user agent's device is a mobile device. (for example: false or true)
   */
  isMobile: boolean;
  /**
   * The collection of brands a user agent identifies as
   */
  brands: {
    /**
     * The user agent's commercial name (for example: 'cURL', 'Edge', 'The World’s Best Web Browser')
     */
    brand: string;
    /**
     * The user agent's marketing version, which includes distinguishable web-exposed features (for example: '72', '3', or '12.1')
     */
    version: string;
  }[];
  /**
   * The user agent's underlying CPU architecture (for example: 'ARM64', or 'ia32')
   */
  architecture?: string | null;
  /**
   * The user agent's device model (for example: '', or 'Pixel 2 XL')
   */
  model?: string | null;
  /**
   * The user agent's operating system’s commercial name. (for example: 'Windows', 'iOS', or 'AmazingOS')
   */
  platform?: string | null;
  /**
   * The user agent's operating system’s version. (for example: 'NT 6.0', '15', or '17G')
   */
  platformVersion?: string | null;
  /**
   * The user agent's build version (for example: '72.0.3245.12', '3.14159', or '297.70E04154A')
   */
  uaFullVersion?: string | null;
}
