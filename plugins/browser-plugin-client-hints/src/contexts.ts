/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
