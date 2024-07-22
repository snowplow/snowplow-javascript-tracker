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
import { ErrorTrackingPlugin, trackError } from '../src';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('evt.e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('evt.ue_pr')));
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

describe('AdTrackingPlugin', () => {
  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
  });
  addTracker('sp2', 'sp2', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
  });
  addTracker('sp3', 'sp3', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
  });
  addTracker('sp4', 'sp4', 'js-3.0.0', '', state, {
    encodeBase64: false,
    plugins: [ErrorTrackingPlugin()],
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

  it('trackError adds the expected application error event to the queue', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(state.outQueues[0])
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

  it('trackError accepts empty error messages', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(state.outQueues[1])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: '',
      },
    });
  });

  it('trackError replaces undefined messages with placeholder', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(state.outQueues[2])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: "JS Exception. Browser doesn't support ErrorEvent API",
      },
    });
  });

  it('trackError replaces undefined messages with placeholder', () => {
    expect(
      extractUeEvent('iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1').from(state.outQueues[3])
    ).toMatchObject({
      schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
      data: {
        message: 'y'.repeat(2048),
        stackTrace: 'x'.repeat(8192),
      },
    });
  });
});
