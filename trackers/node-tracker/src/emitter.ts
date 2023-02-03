/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
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

import { Payload } from '@snowplow/tracker-core';

export interface Emitter {
  flush: () => void;
  input: (payload: Payload) => void;
}

/**
 * Convert all fields in a payload dictionary to strings
 *
 * @param payload - Payload on which the new dictionary is based
 */
export const preparePayload = (payload: Payload): Record<string, string> => {
  const stringifiedPayload: Record<string, string> = {};

  const finalPayload = addDeviceSentTimestamp(payload);

  for (const key in finalPayload) {
    if (Object.prototype.hasOwnProperty.call(finalPayload, key)) {
      stringifiedPayload[key] = String(finalPayload[key]);
    }
  }
  return stringifiedPayload;
};

/**
 * Adds the 'stm' paramater with the current time to the payload
 * @param payload - The payload which will be mutated
 */
const addDeviceSentTimestamp = (payload: Payload): Payload => {
  payload['stm'] = new Date().getTime().toString();
  return payload;
};
