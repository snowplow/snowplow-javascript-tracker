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

import test from 'ava';
import { isJson, isNonEmptyJson, payloadBuilder, payloadJsonProcessor } from '../src/payload';

const sampleJson = {
  schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
  data: [
    {
      schema: 'iglu:com.example_company/page/jsonschema/1-2-1',
      data: {
        pageType: 'test',
        lastUpdated: new Date(Date.UTC(2014, 1, 26)),
      },
    },
    {
      schema: 'iglu:com.example_company/user/jsonschema/2-0-0',
      data: {
        userType: 'tester',
      },
    },
  ],
};

const expectedPayloads = [
  {
    co: '{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:com.example_company/page/jsonschema/1-2-1","data":{"pageType":"test","lastUpdated":"2014-02-26T00:00:00.000Z"}},{"schema":"iglu:com.example_company/user/jsonschema/2-0-0","data":{"userType":"tester"}}]}',
  },
  {
    cx: 'eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uZXhhbXBsZV9jb21wYW55L3BhZ2UvanNvbnNjaGVtYS8xLTItMSIsImRhdGEiOnsicGFnZVR5cGUiOiJ0ZXN0IiwibGFzdFVwZGF0ZWQiOiIyMDE0LTAyLTI2VDAwOjAwOjAwLjAwMFoifX0seyJzY2hlbWEiOiJpZ2x1OmNvbS5leGFtcGxlX2NvbXBhbnkvdXNlci9qc29uc2NoZW1hLzItMC0wIiwiZGF0YSI6eyJ1c2VyVHlwZSI6InRlc3RlciJ9fV19',
  },
];

test('JSON Payload identifies as JSON', (t) => {
  const json = {
    name: 'john',
    properties: {
      age: 30,
      languages: ['English', 'French'],
    },
  };

  t.is(isJson(json), true);
});

test('non-JSON Payload doesnt identify as JSON', (t) => {
  const nonJson = function () {
    return {};
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t.is(isJson(nonJson as any), false);
});

test('Empty Payload identifies as an empty JSON', (t) => {
  const emptyJson = {};
  t.is(isNonEmptyJson(emptyJson), false);
});

test('Build a payload', (t) => {
  const sb = payloadBuilder();
  sb.add('e', 'pv');
  sb.add('tv', 'js-2.0.0');

  t.deepEqual(sb.build(), { e: 'pv', tv: 'js-2.0.0' });
});

test('Do not add undefined values to a payload', (t) => {
  const sb = payloadBuilder();
  sb.add('e', undefined);

  t.deepEqual(sb.build(), {}, 'Undefined values should not be added to the payload');
});

test('Do not add null values to a payload', (t) => {
  const sb = payloadBuilder();
  sb.add('e', undefined);

  t.deepEqual(sb.build(), {}, 'Null values should not be added to the payload');
});

test('Add a dictionary of name-value pairs to the payload', (t) => {
  const sb = payloadBuilder();
  sb.addDict({
    e: 'pv',
    tv: 'js-2.0.0',
  });

  t.deepEqual(
    sb.build(),
    { e: 'pv', tv: 'js-2.0.0' },
    'A dictionary of name-value pairs should be added to the payload'
  );
});

test('Add a JSON to the payload', (t) => {
  const sb = payloadBuilder();
  sb.withJsonProcessor(payloadJsonProcessor(false));
  sb.addJson('cx', 'co', sampleJson);

  t.deepEqual(sb.build(), expectedPayloads[0], 'JSON should be added correctly');
});

test('Add a base 64 encoded JSON to the payload', (t) => {
  const sb = payloadBuilder();
  sb.withJsonProcessor(payloadJsonProcessor(true));
  sb.addJson('cx', 'co', sampleJson);

  t.deepEqual(sb.build(), expectedPayloads[1], 'JSON should be encoded correctly');
});

test('payloadBuilder with no json processor, processes no json', (t) => {
  const sb = payloadBuilder();
  sb.addJson('cx', 'co', sampleJson);

  t.deepEqual(sb.build(), {}, 'JSON should be missing');
});

test('Add a context entity', (t) => {
  const sb = payloadBuilder();
  sb.withJsonProcessor(payloadJsonProcessor(false));
  sb.addContextEntity(sampleJson.data[0]);
  sb.addContextEntity(sampleJson.data[1]);
  let payload = sb.build();
  t.deepEqual(payload, expectedPayloads[0], 'JSON should be added correctly');
});

test('Maintain context entities after subsequent builds', (t) => {
  const sb = payloadBuilder();
  sb.withJsonProcessor(payloadJsonProcessor(true));
  sb.addContextEntity(sampleJson.data[0]);
  sb.build();
  sb.addContextEntity(sampleJson.data[1]);
  let payload = sb.build();
  t.deepEqual(payload, expectedPayloads[1], 'JSON should be added correctly');
});

test('Combines context entities added through addJson and addContextEntity', (t) => {
  const sb = payloadBuilder();
  sb.withJsonProcessor(payloadJsonProcessor(true));
  sb.addJson('cx', 'co', { schema: sampleJson.schema, data: [sampleJson.data[0]] });
  sb.addContextEntity(sampleJson.data[1]);
  let payload = sb.build();
  t.deepEqual(payload, expectedPayloads[1], 'JSON should be added correctly');
});
