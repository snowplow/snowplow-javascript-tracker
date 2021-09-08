/*
 * Copyright (c) 2021 Snowplow Analytics Ltd
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

import { BrowserTracker } from '@snowplow/browser-tracker-core';
import { trackerCore } from '@snowplow/tracker-core';
import { enableMyContext, TemplatePlugin, trackMyEvent } from '../src/index';

describe('Template Plugin', () => {
  it('Returns a context', () => {
    const core = trackerCore();
    const plugin = TemplatePlugin();
    plugin.activateBrowserPlugin?.({ core } as BrowserTracker);
    expect(plugin.contexts?.()).toHaveLength(0);
    enableMyContext({ property: 'value' });
    expect(plugin.contexts?.()).toHaveLength(1);
    expect(plugin.contexts?.()).toMatchObject([
      {
        schema: 'iglu:com.acme/my_context/jsonschema/1-0-0',
        data: { property: 'value' },
      },
    ]);
  });

  it('Tracks an event', (done) => {
    const core = trackerCore({
      callback: (payloadBuilder) => {
        const payload = payloadBuilder.getPayload();
        const payloadJson = payloadBuilder.getJson();
        expect(payload['e']).toEqual('ue');
        expect(payloadJson[0].keyIfEncoded).toEqual('ue_px');
        expect(payloadJson[0].json).toMatchObject({
          data: {
            schema: 'iglu:com.acme/my_event/jsonschema/1-0-0',
            data: { eventProp: 'something' },
          },
        });
        done();
      },
    });
    TemplatePlugin().activateBrowserPlugin?.({ core } as BrowserTracker);
    trackMyEvent({ schema: 'iglu:com.acme/my_event/jsonschema/1-0-0', data: { eventProp: 'something' } });
  });
});
