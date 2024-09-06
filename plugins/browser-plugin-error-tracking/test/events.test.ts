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
import { ErrorTrackingPlugin, enableErrorTracking, trackError } from '../src';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('ue_pr')));
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

describe('ErrorTrackingPlugin', () => {
  const eventStore1 = newInMemoryEventStore({});
  const eventStore2 = newInMemoryEventStore({});
  const eventStore3 = newInMemoryEventStore({});
  const eventStore4 = newInMemoryEventStore({});
  const eventStore5 = newInMemoryEventStore({});

  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
    eventStore: eventStore1,
    customFetch: async () => new Response(null, { status: 500 }),
  });
  addTracker('sp2', 'sp2', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
    eventStore: eventStore2,
    customFetch: async () => new Response(null, { status: 500 }),
  });
  addTracker('sp3', 'sp3', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
    eventStore: eventStore3,
    customFetch: async () => new Response(null, { status: 500 }),
  });
  addTracker('sp4', 'sp4', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
    eventStore: eventStore4,
    customFetch: async () => new Response(null, { status: 500 }),
  });
  addTracker('sp5', 'sp5', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
    eventStore: eventStore5,
    customFetch: async () => new Response(null, { status: 500 }),
  });

  const error = new Error('this is an error');
  error.stack = 'stacktrace-1';

  const oversizedError = new Error('this is a longer error');
  oversizedError.stack = 'x'.repeat(10000);
  const oversizedMessage = 'y'.repeat(10000);

  trackError(
    {
      message: 'message-1',
      colno: 1,
      lineno: 10,
      filename: 'index.js',
      error: error,
    },
    ['sp1']
  );

  trackError(
    {
      message: '',
    },
    ['sp2']
  );

  trackError(
    {
      message: <any>undefined,
    },
    ['sp3']
  );

  trackError(
    {
      message: oversizedMessage,
      error: oversizedError,
    },
    ['sp4']
  );

  enableErrorTracking({}, ['sp5']);

  it('trackError adds the expected application error event to the queue', async () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(
        await eventStore1.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        programmingLanguage: 'JAVASCRIPT',
        message: 'message-1',
        stackTrace: 'stacktrace-1',
        lineNumber: 10,
        lineColumn: 1,
        fileName: 'index.js',
      },
    });
  });

  it('trackError accepts empty error messages', async () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(
        await eventStore2.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: '',
      },
    });
  });

  it('trackError replaces undefined messages with placeholder', async () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(
        await eventStore3.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: 'trackError called without required message',
      },
    });
  });

  it('trackError truncates long message and stack traces', async () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(
        await eventStore4.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: 'y'.repeat(2048),
        stackTrace: 'x'.repeat(8192),
      },
    });
  });

  it('trackError should be called by listener for resource errors', async () => {
    const resourceUrl = '/fake-should-404.js';

    await new Promise((resolve) => {
      const resource = document.createElement('script');
      resource.onerror = resolve;
      resource.src = resourceUrl;
      document.head.appendChild(resource);
    });

    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(
        await eventStore5.getAllPayloads()
      )
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: 'Non-script error on SCRIPT element',
        fileName: 'http://localhost' + resourceUrl,
      },
    });
  });
});
