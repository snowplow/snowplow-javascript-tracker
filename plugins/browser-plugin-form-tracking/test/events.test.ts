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
import { enableFormTracking, disableFormTracking, FormTrackingPlugin } from '../src';

const getUEEvents = (arr: any) => arr.filter(({ evt }: any) => evt.e === 'ue');
const extractEventProperties = (arr: any) => arr.map(({ evt }: any) => JSON.parse(evt.ue_pr).data);
const extractUeEvent = (schema: string) => ({
  from: (arr: any, n: number = 0) =>
    extractEventProperties(getUEEvents(arr))
      .reduce((acc: any[], curr: any[]) => acc.concat([curr]), [])
      .filter((evt: any) => evt.schema === schema)[n],
});

describe('FormTrackingPlugin', () => {
  const state = new SharedState();
  addTracker('sp1', 'sp1', 'js-3.0.0', '', state, {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [FormTrackingPlugin()],
  });

  const $addEventListener = jest.spyOn(document, 'addEventListener');
  const $removeEventListener = jest.spyOn(document, 'removeEventListener');

  document.body.appendChild(Object.assign(document.createElement('form'), { id: 'test-form' }));

  afterEach(() => {
    // clear the outQueue(s) after each test
    state.outQueues.forEach((queue) => Array.isArray(queue) && (queue.length = 0));
    jest.clearAllMocks();
    document.forms[0].replaceChildren();
  });

  describe('enableFormTracking', () => {
    it('does nothing for no trackers', () => {
      enableFormTracking({}, []);
      expect($addEventListener).not.toBeCalled();
    });

    it('adds form listeners by default', () => {
      enableFormTracking();

      expect($addEventListener).toBeCalledWith('focus', expect.anything(), true);
      expect($addEventListener).toBeCalledWith('change', expect.anything(), true);
      expect($addEventListener).toBeCalledWith('submit', expect.anything(), true);
    });

    it('tracks focus on fields that already exist', () => {
      const target = document.createElement('input');
      document.forms[0].appendChild(target);

      enableFormTracking();

      target.focus();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
        },
      });
    });

    it('tracks focus on fields added after enabling', () => {
      enableFormTracking();

      const target = document.createElement('input');
      document.forms[0].appendChild(target);

      target.focus();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
        },
      });
    });

    it('tracks changes on field values', () => {
      enableFormTracking();

      const target = document.createElement('input');
      document.forms[0].appendChild(target);

      target.value = 'changed';
      target.dispatchEvent(new Event('change'));

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
          value: 'changed',
        },
      });
    });

    it('associates non-nested forms correctly', () => {
      enableFormTracking();

      const target = document.createElement('input');
      target.setAttribute('form', 'test-form');
      document.body.appendChild(target);

      target.focus();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
        },
      });

      document.body.removeChild(target);
    });

    it('ignores password values', () => {
      enableFormTracking();

      const target = document.createElement('input');
      target.type = 'password';
      target.value = 'initial';
      document.forms[0].appendChild(target);

      target.focus();
      target.value = 'zomg_private!1';
      target.dispatchEvent(new Event('change'));

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
          nodeName: 'INPUT',
          elementType: 'password',
          value: null,
        },
      });

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
          nodeName: 'INPUT',
          type: 'password',
          value: null,
        },
      });
    });

    it('does not listen for ignored event types', () => {
      enableFormTracking({ options: { events: ['focus_form'] } });
      expect($addEventListener).toBeCalledTimes(1);
      expect($addEventListener).toBeCalledWith('focus', expect.anything(), true);
    });

    it('ignores form that are not explicitly specified', () => {
      const extra = document.createElement('form');
      extra.id = 'skipme';
      document.body.appendChild(extra);

      enableFormTracking({ options: { forms: [document.forms[0]] } });

      let target = document.createElement('input');
      extra.appendChild(target);
      target.focus();

      expect(state.outQueues[0]).toHaveLength(0);

      target = document.createElement('input');
      document.forms[0].appendChild(target);
      target.focus();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'test-form',
        },
      });

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0').from(state.outQueues[0])
      ).not.toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
        data: {
          formId: 'skipme',
        },
      });

      document.body.removeChild(extra);
    });
  });

  describe('disableFormTracking', () => {
    it('removes any listeners added', () => {
      enableFormTracking();
      disableFormTracking();

      const addCalls = $addEventListener.mock.calls;

      expect(addCalls).toHaveLength(3);

      addCalls.forEach((call) => expect($removeEventListener.mock.calls).toContainEqual(call));
    });
  });
});
