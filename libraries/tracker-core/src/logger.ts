/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
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

const label = 'Snowplow: ';

export enum LOG_LEVEL {
  none = 0,
  error = 1,
  warn = 2,
  debug = 3,
  info = 4,
}

export interface Logger {
  setLogLevel: (level: LOG_LEVEL) => void;
  info: (message: string, ...extraParams: unknown[]) => void;
  debug: (message: string, ...extraParams: unknown[]) => void;
  warn: (message: string, error?: unknown, ...extraParams: unknown[]) => void;
  error: (message: string, error?: unknown, ...extraParams: unknown[]) => void;
}

export const LOG = logger();

function logger(logLevel: LOG_LEVEL = LOG_LEVEL.warn): Logger {
  function setLogLevel(level: LOG_LEVEL) {
    if (LOG_LEVEL[level]) {
      logLevel = level;
    } else {
      logLevel = LOG_LEVEL.warn;
    }
  }

  /**
   * Log errors, with or without error object
   */
  function error(message: string, error?: unknown, ...extraParams: unknown[]) {
    if (logLevel >= LOG_LEVEL.error && typeof console !== 'undefined') {
      const logMsg = label + message + '\n';
      if (error) {
        console.error(logMsg + '\n', error, ...extraParams);
      } else {
        console.error(logMsg, ...extraParams);
      }
    }
  }

  /**
   * Log warnings, with or without error object
   */
  function warn(message: string, error?: unknown, ...extraParams: unknown[]) {
    if (logLevel >= LOG_LEVEL.warn && typeof console !== 'undefined') {
      const logMsg = label + message;
      if (error) {
        console.warn(logMsg + '\n', error, ...extraParams);
      } else {
        console.warn(logMsg, ...extraParams);
      }
    }
  }

  /**
   * Log debug messages
   */
  function debug(message: string, ...extraParams: unknown[]) {
    if (logLevel >= LOG_LEVEL.debug && typeof console !== 'undefined') {
      console.debug(label + message, ...extraParams);
    }
  }

  /**
   * Log info messages
   */
  function info(message: string, ...extraParams: unknown[]) {
    if (logLevel >= LOG_LEVEL.info && typeof console !== 'undefined') {
      console.info(label + message, ...extraParams);
    }
  }

  return { setLogLevel, warn, error, debug, info };
}
