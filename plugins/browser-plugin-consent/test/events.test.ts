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

import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import F from 'lodash/fp';
import { ConsentPlugin, trackConsentWithdrawn, trackConsentGranted, enableGdprContext } from '../src';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('evt.e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.ue_pr')));
const extractEventContext = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.co')));
const extractUeEvent = (schema: string) => {
  return {
    from: F.compose(
      F.first,
      F.filter(F.compose(F.eq(schema), F.get('schema'))),
      F.flatten,
      extractEventProperties,
      getUEEvents
    ),
  };
};
const extractContext = (schema: string) => {
  return {
    from: F.compose(
      F.first,
      F.filter(F.compose(F.eq(schema), F.get('schema'))),
      F.flatten,
      extractEventContext,
      getUEEvents
    ),
  };
};

describe('AdTrackingPlugin', () => {
  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [ConsentPlugin()],
  });
  addTracker('sp2', 'sp2', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [ConsentPlugin()],
  });

  enableGdprContext({
    basisForProcessing: 'legalObligation',
    documentDescription: 'doc-desc-1',
    documentId: 'doc-id-1',
    documentVersion: 'doc-ver-1',
  });

  trackConsentWithdrawn(
    {
      all: true,
      description: 'desc-1',
      id: 'id-1',
      name: 'name-1',
      version: '1.1.0',
    },
    ['sp1']
  );

  trackConsentGranted(
    {
      description: 'desc-2',
      id: 'id-2',
      name: 'name-2',
      version: '1.2.0',
      expiry: '2020-01-01T00:00:00Z',
    },
    ['sp2']
  );

  it('trackConsentWithdrawn adds the expected consent withdrawn event to the queue', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
      data: {
        all: true,
      },
    });

    expect(
      extractContext('iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
      data: {
        description: 'desc-1',
        id: 'id-1',
        name: 'name-1',
        version: '1.1.0',
      },
    });
  });

  it('trackConsentGranted adds the expected consent granted event to the queue', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0').from(state.outQueues[1])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
      data: {
        expiry: '2020-01-01T00:00:00Z',
      },
    });

    expect(
      extractContext('iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0').from(state.outQueues[1])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
      data: {
        description: 'desc-2',
        id: 'id-2',
        name: 'name-2',
        version: '1.2.0',
      },
    });
  });

  it('events contain the GDPR context', () => {
    expect(
      extractContext('iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0').from(state.outQueues[0])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
      data: {
        basisForProcessing: 'legal_obligation',
        documentDescription: 'doc-desc-1',
        documentId: 'doc-id-1',
        documentVersion: 'doc-ver-1',
      },
    });

    expect(
      extractContext('iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0').from(state.outQueues[1])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
      data: {
        basisForProcessing: 'legal_obligation',
        documentDescription: 'doc-desc-1',
        documentId: 'doc-id-1',
        documentVersion: 'doc-ver-1',
      },
    });
  });
});
