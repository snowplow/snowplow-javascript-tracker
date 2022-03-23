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

import { WaitUntilOptions } from 'webdriverio';
import util from 'util';

declare module WebdriverIO {
  interface Browser {
    pause: (interval: number) => Promise<unknown>;
  }
}

export const dumpLog = (log: Array<unknown>) => console.log(util.inspect(log, true, null, true));

/**
 * This is a custom implementation of `browser.waitUntil` provided by WDIO as that
 * became unreliable and exited too early. Can be removed once `browser.waitUntil`
 * behaves reliably.
 */
export const waitUntil = async (
  browser: WebdriverIO.Browser,
  condition: () => Promise<boolean>,
  { interval, timeout, timeoutMsg }: Partial<WaitUntilOptions> = {}
) => {
  timeout = timeout ?? 5000;
  interval = interval ?? 500;
  let iterations = timeout / interval;
  for (let i = 1; ; i++) {
    await browser.pause(interval);
    let result = await condition();
    if (i >= iterations) {
      if (!result) {
        throw new Error(timeoutMsg ?? 'Timeout while waiting');
      }
      break;
    } else if (result) {
      break;
    }
  }
};
