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

import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import F from 'lodash/fp';
import { LinkClickTrackingPlugin, trackLinkClick } from '../src';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('evt.e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.ue_pr')));
const extractUeEvent = (schema: string) => {
  return {
    from: (a: any, n: number = 0) =>
      F.nth(
        n,
        F.compose(F.filter(F.compose(F.eq(schema), F.get('schema'))), F.flatten, extractEventProperties, getUEEvents)(a)
      ),
  };
};

describe('LinkClickTrackingPlugin', () => {
  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [LinkClickTrackingPlugin()],
  });

  it('trackLinkClick adds the expected link click event to the queue', () => {
    trackLinkClick({
      targetUrl: 'https://www.example.com',
      elementClasses: ['class-1', 'class-2'],
      elementContent: 'content-1',
      elementId: 'id-1234',
      elementTarget: '_blank',
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
      data: {
        targetUrl: 'https://www.example.com',
        elementClasses: ['class-1', 'class-2'],
        elementContent: 'content-1',
        elementId: 'id-1234',
        elementTarget: '_blank',
      },
    });
  });

  it('trackLinkClick with element adds the expected link click event to the queue', () => {
    const a = Object.assign(document.createElement('a'), {
      href: 'https://www.example.com/abc',
      className: 'class-1 class-2',
      textContent: 'content-1',
      id: 'id-1234',
      target: '_blank',
    });

    trackLinkClick({ element: a });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(state.outQueues[0], 1)
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
      data: {
        targetUrl: 'https://www.example.com/abc',
        elementClasses: ['class-1', 'class-2'],
        //elementContent: missing because disabled in default configuration
        elementId: 'id-1234',
        elementTarget: '_blank',
      },
    });
  });
});
