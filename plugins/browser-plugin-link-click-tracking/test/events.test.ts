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
import { LinkClickTrackingPlugin, disableLinkClickTracking, enableLinkClickTracking, trackLinkClick } from '../src';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('e'))));
const extractEventProperties = F.map(F.compose(F.get('data'), (cx: string) => JSON.parse(cx), F.get('ue_pr')));
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
  const eventStore = newInMemoryEventStore({});
  addTracker('sp1', 'sp1', 'js-3.0.0', '', new SharedState(), {
    stateStorageStrategy: 'cookie',
    encodeBase64: false,
    plugins: [LinkClickTrackingPlugin()],
    eventStore,
    customFetch: async () => new Response(null, { status: 500 }),
  });

  const $addEventListener = jest.spyOn(window, 'addEventListener');
  const $removeEventListener = jest.spyOn(window, 'removeEventListener');

  afterEach(async () => {
    // clear the outQueue(s) after each test
    await eventStore.removeHead(await eventStore.count());
    jest.clearAllMocks();
  });

  describe('trackLinkClick', () => {
    it('adds the specified link click event to the queue', async () => {
      trackLinkClick({
        targetUrl: 'https://www.example.com',
        elementClasses: ['class-1', 'class-2'],
        elementContent: 'content-1',
        elementId: 'id-1234',
        elementTarget: '_blank',
      });

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
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

    it('generates a link click event from a given element and adds it to the queue', async () => {
      const a = Object.assign(document.createElement('a'), {
        href: 'https://www.example.com/abc',
        className: 'class-1 class-2',
        textContent: 'content-1',
        id: 'id-1234',
        target: '_blank',
      });

      trackLinkClick({ element: a });

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
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

    it('does nothing for no trackers', async () => {
      trackLinkClick(
        {
          targetUrl: 'https://www.example.com',
          elementClasses: ['class-1', 'class-2'],
          elementContent: 'content-1',
          elementId: 'id-1234',
          elementTarget: '_blank',
        },
        []
      );

      expect(await eventStore.getAllPayloads()).toHaveLength(0);
    });

    it('does nothing for fake trackers', async () => {
      trackLinkClick(
        {
          targetUrl: 'https://www.example.com',
          elementClasses: ['class-1', 'class-2'],
          elementContent: 'content-1',
          elementId: 'id-1234',
          elementTarget: '_blank',
        },
        ['doesNotExist']
      );

      expect(await eventStore.getAllPayloads()).toHaveLength(0);
    });
  });

  describe('enableLinkClickTracking', () => {
    it('does nothing for no trackers', () => {
      enableLinkClickTracking({}, []);
      expect($addEventListener).not.toBeCalled();
    });

    it('adds click listeners by default', () => {
      enableLinkClickTracking();

      expect($addEventListener).lastCalledWith('click', expect.anything(), true);
    });

    it('adds pseudo-click listeners when requested', () => {
      enableLinkClickTracking({ pseudoClicks: true });
      expect($addEventListener).lastCalledWith('mousedown', expect.anything(), true);
    });

    it('tracks clicks on links that already exist', async () => {
      const target = document.createElement('a');
      target.href = 'https://www.example.com/exists';
      document.body.appendChild(target);

      enableLinkClickTracking();

      target.click();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'https://www.example.com/exists',
        },
      });
    });

    it('tracks clicks on links added after enabling', async () => {
      enableLinkClickTracking();

      const target = document.createElement('a');
      target.href = 'https://www.example.com/dynamic';
      document.body.appendChild(target);

      target.click();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'https://www.example.com/dynamic',
        },
      });
    });

    it('tracks clicks on links without href', async () => {
      enableLinkClickTracking();

      const target = document.createElement('a');
      document.body.appendChild(target);

      target.click();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'about:invalid',
        },
      });
    });

    it('tracks clicks on child elements of links and contents', async () => {
      enableLinkClickTracking({ trackContent: true });

      const parent = document.createElement('a');
      parent.href = 'https://www.example.com/parent';

      const target = document.createElement('span');
      target.textContent = 'child';
      parent.appendChild(target);

      document.body.appendChild(parent);

      target.click();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'https://www.example.com/parent',
          elementContent: '<span>child</span>',
        },
      });
    });

    it('tracks clicks on links in custom components', async () => {
      enableLinkClickTracking();

      window.customElements.define(
        'shadow-link',
        class extends HTMLElement {
          connectedCallback() {
            const a = document.createElement('a');
            a.textContent = 'Shadow';
            a.href = 'https://www.example.com/shadow';

            const shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.appendChild(a);
          }
        }
      );

      const shadow = document.createElement('shadow-link');
      document.body.appendChild(shadow);

      shadow.shadowRoot!.querySelector('a')!.click();

      expect(
        extractUeEvent('iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1').from(
          await eventStore.getAllPayloads()
        )
      ).toMatchObject({
        schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'https://www.example.com/shadow',
        },
      });
    });

    it('doesnt double track clicks', async () => {
      enableLinkClickTracking({ pseudoClicks: true });
      enableLinkClickTracking({ pseudoClicks: false });

      const target = document.createElement('a');
      target.href = 'https://www.example.com/multiple';
      document.body.appendChild(target);

      expect(await eventStore.getAllPayloads()).toHaveLength(0);

      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(1);
    });

    it('ignores links that match denylist criteria', async () => {
      enableLinkClickTracking({ options: { denylist: ['exclude'] } });

      const target = document.createElement('a');
      target.href = 'https://www.example.com/exclude';
      target.className = 'exclude';
      document.body.appendChild(target);

      expect(await eventStore.getAllPayloads()).toHaveLength(0);

      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(0);

      target.className = 'include';
      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(1);
    });

    it('ignores links that dont match allowlist criteria', async () => {
      enableLinkClickTracking({ options: { allowlist: ['include'] } });

      const target = document.createElement('a');
      target.href = 'https://www.example.com/include';
      target.className = 'exclude';
      document.body.appendChild(target);

      expect(await eventStore.getAllPayloads()).toHaveLength(0);

      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(0);

      target.className = 'include';
      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(1);
    });

    it('tracks a single link click with each tracker', async () => {
      addTracker('sp2', 'sp2', 'js-3.0.0', '', new SharedState(), {
        stateStorageStrategy: 'cookie',
        encodeBase64: false,
        plugins: [LinkClickTrackingPlugin()],
        eventStore,
        customFetch: async () => new Response(null, { status: 500 }),
      });

      enableLinkClickTracking();

      const target = document.createElement('a');
      target.href = 'https://www.example.com/exists';
      document.body.appendChild(target);

      target.click();

      expect(await eventStore.getAllPayloads()).toHaveLength(2);
    });
  });

  describe('disableLinkClickTracking', () => {
    it('removes any listeners added', () => {
      enableLinkClickTracking();
      disableLinkClickTracking();

      const addCalls = $addEventListener.mock.calls;

      expect(addCalls).toHaveLength(2);
      expect($removeEventListener.mock.calls).toContainEqual(addCalls[0]);
    });
  });
});
