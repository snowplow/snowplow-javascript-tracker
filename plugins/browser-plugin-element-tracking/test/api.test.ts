import { addTracker, BrowserTracker, SharedState } from '@snowplow/browser-tracker-core';
import type { Logger } from '@snowplow/tracker-core';

import { SnowplowElementTrackingPlugin, endElementTracking, startElementTracking } from '../src';
import { AttributeList } from '../src/types';

/**
 * Note: jsdom does not support IntersectionObserver so unit tests can only cover create/destroy events.
 *
 * https://github.com/jsdom/jsdom/issues/2032
 */

/**
 * The plugin performs asynchronously when possible for performance.
 * To actually see generated events, we need to check for them in a new task.
 * This fn handles boilerplate for that.
 * @param cb Callback making actual assertions
 * @returns Promise resolving after callback succeeds after executing in new task. Rejects if `cb` throws to avoid timeouts.
 */
const inNewTask = (cb: () => void) =>
  new Promise((resolve, reject) => {
    expect.hasAssertions();
    setTimeout(() => {
      try {
        resolve(cb());
      } catch (e) {
        reject(e);
      }
    }, 50);
  });

const eventSDJ = (
  field: string,
  evt: { evt: Record<string, unknown> },
  schema: string
): Record<string, unknown> | Record<string, unknown>[] | undefined => {
  try {
    const payloadString = evt.evt[field] as string;
    const payload = JSON.parse(payloadString);

    if (/^ue_p[rx]$/.test(field)) {
      if (payload.data.schema.split('/').includes(schema)) return payload.data;
    } else if (/^c[ox]$/.test(field)) {
      return payload.data.filter((e: any) => e.schema.split('/').includes(schema)).map((e: any) => e.data);
    }
  } catch (e) {}
  return;
};

const unstructOf = eventSDJ.bind(null, 'ue_pr');
const entityOf = eventSDJ.bind(null, 'co');

const FAKE_CONTEXT_SCHEMA = 'iglu:com.example/custom_entity/jsonschema/1-0-0';

describe('Element Tracking Plugin API', () => {
  const eventQueue: { evt: Record<string, unknown> }[] = [];
  const secondEventQueue: { evt: Record<string, unknown> }[] = [];
  let warnLog: jest.SpyInstance<void, Parameters<Logger['warn']>>;
  let tracker: BrowserTracker;

  beforeAll(() => {
    const state = new SharedState();
    const plugin = SnowplowElementTrackingPlugin({ ignoreNextPageView: false });

    const activateBrowserPlugin = jest.spyOn(plugin, 'activateBrowserPlugin');
    const logger = jest.spyOn(plugin, 'logger');

    tracker = addTracker('test', 'test', 'js-test', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [
        plugin,
        {
          beforeTrack: (pb) => {
            eventQueue.push({ evt: pb.build() });
          },
        },
      ],
      customFetch: async () => new Response(null, { status: 200 }),
    })!;

    expect(activateBrowserPlugin).toHaveBeenCalled();
    expect(logger).toHaveBeenCalledTimes(1);

    addTracker('test2', 'test2', 'js-test', '', state, {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [
        plugin,
        {
          beforeTrack: (pb) => {
            secondEventQueue.push({ evt: pb.build() });
          },
        },
      ],
      customFetch: async () => new Response(null, { status: 200 }),
    });

    warnLog = jest.spyOn(logger.mock.calls[0][0], 'warn');
  });

  afterEach(() => {
    endElementTracking();
    document.body.replaceChildren();
    warnLog.mockReset();
    eventQueue.length = 0;
    secondEventQueue.length = 0;
  });

  describe('startElementTracking', () => {
    it('warns for unavailable observer', () => {
      expect(typeof IntersectionObserver).toBe('undefined');

      startElementTracking({ elements: { selector: 'div', expose: true } });

      return inNewTask(() => {
        expect(warnLog).toHaveBeenCalled();
        expect(eventQueue).toHaveLength(0);
      });
    });

    it('silent when not requesting unavailable observer', () => {
      expect(typeof IntersectionObserver).toBe('undefined');
      expect(typeof MutationObserver).toBe('function');

      startElementTracking({ elements: { selector: 'div', expose: false, create: true } });

      return inNewTask(() => {
        expect(warnLog).not.toHaveBeenCalled();
        expect(eventQueue).toHaveLength(0);
      });
    });

    it('tracks element creation', () => {
      startElementTracking({ elements: { selector: '.newelement', expose: false, create: true } });

      const div = document.createElement('div');
      div.classList.add('newelement');
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
        expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
        expect(entityOf(eventQueue[0], 'element')).toHaveLength(1);
      });
    });

    it('tracks element removal', () => {
      const div = document.createElement('div');
      div.classList.add('existing');
      document.body.appendChild(div);

      startElementTracking({ elements: [{ selector: '.existing', expose: false, destroy: true }] });

      document.body.removeChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
        expect(unstructOf(eventQueue[0], 'destroy_element')).toBeDefined();
        expect(entityOf(eventQueue[0], 'element')).toHaveLength(1);
      });
    });

    it('tracks element mutation', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      startElementTracking({ elements: [{ selector: '.mutated', expose: false, create: true, destroy: true }] });

      // we split these changes into microtasks or else the double toggle can't actually be observed
      return Promise.resolve()
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() =>
          inNewTask(() => {
            expect(eventQueue).toHaveLength(3);
            expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
            expect(unstructOf(eventQueue[1], 'destroy_element')).toBeDefined();
            expect(unstructOf(eventQueue[2], 'create_element')).toBeDefined();
          })
        );
    });

    it('includes advanced details', () => {
      startElementTracking({
        elements: [
          {
            selector: 'body',
            component: true,
          },
          {
            selector: '.advanced',
            expose: false,
            create: {
              when: 'always',
            },
            details: { properties: ['className'] },
            contents: { selector: 'h1', details: { content: { heading_text: '.+' } } },
            context: () => [{ schema: FAKE_CONTEXT_SCHEMA, data: { from: 'config' } }],
          },
        ],
        context: [{ schema: FAKE_CONTEXT_SCHEMA, data: { from: 'batch' } }],
      });

      const div = document.createElement('div');
      div.classList.add('advanced');
      const heading = document.createElement('h1');
      heading.replaceChildren('Heading');
      div.replaceChildren(heading);
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
        expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();

        expect(entityOf(eventQueue[0], 'element')).toHaveLength(2); // .advanced and body component
        const elementEntities = entityOf(eventQueue[0], 'element');
        const elementEntity = Array.isArray(elementEntities) ? elementEntities[0] : (undefined as never);
        const attributeList = elementEntity.attributes as AttributeList;
        expect(attributeList).toHaveLength(1);
        expect(attributeList).toEqual([
          {
            source: 'properties',
            attribute: 'className',
            value: 'advanced',
          },
        ]);

        expect(entityOf(eventQueue[0], 'component_parents')).toEqual([
          {
            element_name: '.advanced',
            component_list: ['body'],
          },
        ]);
        expect(entityOf(eventQueue[0], 'element_content')).toEqual([
          {
            parent_name: '.advanced',
            parent_index: 1,
            element_name: 'h1',
            element_index: 1,
            attributes: [
              {
                source: 'content',
                attribute: 'heading_text',
                value: 'Heading',
              },
            ],
          },
        ]);
        expect(entityOf(eventQueue[0], 'custom_entity')).toEqual([{ from: 'batch' }, { from: 'config' }]);
      });
    });

    it('frequency: once', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      const div2 = document.createElement('div');
      document.body.appendChild(div2);

      startElementTracking({ elements: [{ selector: '.mutated', expose: false, create: { when: 'once' } }] });

      // we split these changes into microtasks or else the double toggle can't actually be observed
      return Promise.resolve()
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated'); // this create should be skipped
        })
        .then(() => {
          div2.classList.toggle('mutated'); // second div should skip too
        })
        .then(() =>
          inNewTask(() => {
            expect(eventQueue).toHaveLength(1);
            expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
          })
        );
    });

    it('frequency: element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      const div2 = document.createElement('div');
      document.body.appendChild(div2);

      startElementTracking({
        elements: [{ selector: '.mutated', expose: false, create: { when: 'element' }, destroy: true }],
      });

      // we split these changes into microtasks or else the double toggle can't actually be observed
      return Promise.resolve()
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated'); // this create should be skipped
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div2.classList.toggle('mutated'); // but not for div2
        })
        .then(() =>
          inNewTask(() => {
            expect(eventQueue).toHaveLength(4);
            expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
            expect(unstructOf(eventQueue[1], 'destroy_element')).toBeDefined();
            expect(unstructOf(eventQueue[2], 'destroy_element')).toBeDefined();
            expect(unstructOf(eventQueue[3], 'create_element')).toBeDefined();
          })
        );
    });

    it('frequency: pageview', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      startElementTracking({
        elements: [{ selector: '.mutated', expose: false, create: { when: 'pageview' }, destroy: true }],
      });

      // we split these changes into microtasks or else the double toggle can't actually be observed
      return Promise.resolve()
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() => {
          div.classList.toggle('mutated'); // this create should be skipped
        })
        .then(() => {
          div.classList.toggle('mutated');
        })
        .then(() =>
          inNewTask(() => {
            tracker.trackPageView(); // new task or the order is weird
          })
        )
        .then(() => {
          div.classList.toggle('mutated'); // new pv, don't skip this one
        })
        .then(() =>
          inNewTask(() => {
            expect(eventQueue).toHaveLength(5);
            expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
            expect(unstructOf(eventQueue[1], 'destroy_element')).toBeDefined();
            expect(unstructOf(eventQueue[2], 'destroy_element')).toBeDefined();
            expect(eventQueue[3].evt.e).toBe('pv');
            expect(unstructOf(eventQueue[4], 'create_element')).toBeDefined();
          })
        );
    });

    it('evaluates conditions', () => {
      startElementTracking({
        elements: {
          selector: 'div',
          expose: false,
          create: {
            when: 'always',
            condition: { dataset: ['fake'] },
          },
        },
      });

      const div = document.createElement('div');
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(0);
      });
    });

    it('dedupes by id', () => {
      startElementTracking({
        elements: {
          id: 'test',
          selector: 'span',
          expose: false,
          create: true,
        },
      });

      startElementTracking({
        elements: {
          id: 'test',
          selector: 'div',
          expose: false,
          create: true,
        },
      });

      for (const nodeName of ['div', 'span']) {
        const element = document.createElement(nodeName);
        document.body.appendChild(element);
      }

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
      });
    });

    it('adds element stats', () => {
      startElementTracking({
        elements: { selector: '.newelement', expose: false, create: false, includeStats: 'page_view' },
      });

      const div = document.createElement('div');
      div.classList.add('newelement');
      document.body.appendChild(div);

      tracker.trackPageView();
      tracker.trackPageView();

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(2);
        expect(entityOf(eventQueue[0], 'element_statistics')).toHaveLength(1);
        expect(entityOf(eventQueue[1], 'element_statistics')).toHaveLength(1);
      });
    });
  });

  describe('multiple tracker', () => {
    it('works with multiple trackers', () => {
      startElementTracking({ elements: { selector: '.newelement', expose: false, create: true } });

      const div = document.createElement('div');
      div.classList.add('newelement');
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
        expect(secondEventQueue).toHaveLength(1);
        expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
        expect(unstructOf(secondEventQueue[0], 'create_element')).toBeDefined();
        expect(entityOf(eventQueue[0], 'element')).toHaveLength(1);
        expect(entityOf(secondEventQueue[0], 'element')).toHaveLength(1);
      });
    });

    it('works with selective trackers', () => {
      startElementTracking({ elements: { selector: '.newelement', expose: false, create: true } }, ['test']);

      const div = document.createElement('div');
      div.classList.add('newelement');
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
        expect(secondEventQueue).toHaveLength(0);
        expect(unstructOf(eventQueue[0], 'create_element')).toBeDefined();
        expect(entityOf(eventQueue[0], 'element')).toHaveLength(1);
      });
    });
  });

  describe('endElementTracking', () => {
    it('untracks by id', () => {
      startElementTracking({
        elements: {
          id: 'test',
          selector: 'div',
          expose: false,
          create: true,
        },
      });

      endElementTracking({ elementIds: ['test'] });

      const div = document.createElement('div');
      document.body.appendChild(div);

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(0);
      });
    });

    it('untracks by name', () => {
      startElementTracking({
        elements: [
          {
            selector: 'div',
            expose: false,
            create: true,
          },
          {
            selector: 'span',
            expose: false,
            create: true,
          },
        ],
      });

      endElementTracking({ elements: ['span'] });

      for (const nodeName of ['div', 'span']) {
        const element = document.createElement(nodeName);
        document.body.appendChild(element);
      }

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(1);
      });
    });

    it('untracks by filter', () => {
      startElementTracking({
        elements: [
          {
            selector: 'div',
            expose: false,
            create: true,
          },
          {
            selector: 'span',
            expose: false,
            create: true,
          },
        ],
      });

      endElementTracking({ filter: (config) => config.create.when === 'always' });

      for (const nodeName of ['div', 'span']) {
        const element = document.createElement(nodeName);
        document.body.appendChild(element);
      }

      return inNewTask(() => {
        expect(eventQueue).toHaveLength(0);
      });
    });
  });
});
