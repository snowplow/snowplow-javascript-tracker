import { defineBoundaries, getMatchingElements, nodeIsElement, shouldTrackExpose } from '../src/util';
import type { Configuration } from '../src/configuration';

const TEMPLATE_CONFIG: Configuration = {
  name: 'template',
  selector: '',
  shadowOnly: false,
  component: false,
  context: () => [],
  trackers: [],
  create: { when: 'never' },
  destroy: { when: 'never' },
  expose: { when: 'never', minPercentage: 0, boundaryPixels: 0, minSize: 0, minTimeMillis: 0 },
  obscure: { when: 'never' },
  state: 0,
  details: [],
  contents: [],
  includeStats: [],
};

const TEMPLATE_DOMRECT: DOMRectReadOnly = {
  bottom: 0,
  top: 0,
  left: 0,
  right: 0,
  height: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON() {},
};

const TEMPLATE_INTERSECTION: IntersectionObserverEntry = {
  time: 0,
  isIntersecting: true,
  target: document.body,
  rootBounds: null,
  boundingClientRect: TEMPLATE_DOMRECT,
  intersectionRatio: 0,
  intersectionRect: TEMPLATE_DOMRECT,
};

describe('utils', () => {
  describe('defineBoundaries', () => {
    it.each([
      [0, [0, 0, 0, 0]],
      [1, [1, 1, 1, 1]],
      [[0, 1] as [number, number], [0, 1, 0, 1]],
      [[2, 2, 2, 2] as [number, number, number, number], [2, 2, 2, 2]],
      [[2, 2, 2] as any as [number, number, number, number], [0, 0, 0, 0]], // silent error
      [{} as any as number, [0, 0, 0, 0]], // silent error
    ])('interprets: %j', (provided, expected) => {
      const [boundTop, boundRight, boundBottom, boundLeft] = expected;
      expect(defineBoundaries(provided)).toEqual({
        boundTop,
        boundRight,
        boundBottom,
        boundLeft,
      });
    });
  });

  describe('getMatchingElements', () => {
    it('queries for nodes', () => {
      const config: Configuration = { ...TEMPLATE_CONFIG, selector: 'body' };
      const results = getMatchingElements(config);
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(document.body);
      expect(nodeIsElement(results[0])).toBe(true);

      const explicitTarget = getMatchingElements(config, document);
      expect(results).toEqual(explicitTarget);
    });

    describe('shadow host support', () => {
      const elements: Element[] = [];
      const config: Configuration = { ...TEMPLATE_CONFIG, selector: 'span' };

      beforeAll(() => {
        const host = document.createElement('div');
        host.id = 'shadowHost';
        const shadow = host.attachShadow({ mode: 'open' });
        document.body.appendChild(host);

        for (let i = 5; i > 0; i--) {
          const el = document.createElement('span');
          shadow.appendChild(el);
          elements.push(el);
        }
      });

      afterAll(() => {
        document.body.replaceChildren();
      });

      it('should not find from shadow roots by default', () => {
        expect(getMatchingElements(config)).toHaveLength(0);
      });

      it('should descend shadow hosts matching shadowSelector', () => {
        const shadowConfig: Configuration = {
          ...config,
          shadowSelector: '#shadowHost',
        };

        expect(getMatchingElements(shadowConfig)).toEqual(elements);
      });

      it('should respect shadowOnly setting', () => {
        const shadowConfig: Configuration = {
          ...config,
          shadowSelector: '#shadowHost',
          shadowOnly: false,
        };

        let results = getMatchingElements(shadowConfig);

        expect(results).toEqual(elements);

        // with shadowOnly: false, should find a non-shadow span, too
        const addition = document.createElement('span');
        document.body.appendChild(addition);

        results = getMatchingElements(shadowConfig);
        expect(results).not.toEqual(elements);
        expect(results).toHaveLength(elements.length + 1);
        expect(results).toEqual(elements.concat([addition]));

        // with shadowOnly: true, should ignore the non-shadow span
        results = getMatchingElements({ ...shadowConfig, shadowOnly: true });
        expect(results).toEqual(elements);
      });

      it('should find nested shadow targets', () => {
        const shadowConfig: Configuration = {
          ...config,
          shadowSelector: '#shadowHost',
          shadowOnly: true,
        };

        let results = getMatchingElements(shadowConfig);

        expect(results).toEqual(elements);

        const host = document.querySelector('#shadowHost')!.shadowRoot!;
        const addition = document.createElement('span');
        host.appendChild(addition);

        results = getMatchingElements(shadowConfig);
        expect(results).not.toEqual(elements);
        expect(results).toHaveLength(elements.length + 1);
        expect(results).toEqual(elements.concat([addition]));
      });
    });
  });

  describe('shouldTrackExpose', () => {
    it.each([
      ['frequency: never', { when: 'never' as const }, {}, false],
      ['not intersecting', { when: 'always' as const }, { isIntersecting: false }, false],
      ['intersecting', { when: 'always' as const }, { isIntersecting: true }, true],
      ['zero-size', { when: 'always' as const, minSize: 1 }, { isIntersecting: true }, false],
      [
        'partial view',
        { when: 'always' as const, minPercentage: 1 },
        {
          intersectionRatio: (100 * 100) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 100, height: 100 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        false,
      ],
      [
        'sufficent view',
        { when: 'always' as const, minPercentage: (200 * 160) / (200 * 200) },
        {
          intersectionRatio: (200 * 160) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 200, height: 160 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        true,
      ],
      [
        'insufficent view',
        { when: 'always' as const, minPercentage: (200 * 160) / (200 * 200) },
        {
          intersectionRatio: (200 * 159) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 200, height: 159 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        false,
      ],
      [
        'shrunken element',
        { when: 'always' as const, minPercentage: (200 * 160) / (200 * 200), boundaryPixels: -100 },
        {
          intersectionRatio: (200 * 159) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 200, height: 159 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        true,
      ],
      [
        'enlarged element - possible',
        { when: 'always' as const, minPercentage: 0.1, boundaryPixels: 100 },
        {
          intersectionRatio: (200 * 200) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        true,
      ],
      [
        'enlarged element - impossible',
        { when: 'always' as const, minPercentage: 1, boundaryPixels: 100 },
        {
          intersectionRatio: (200 * 200) / (200 * 200),
          intersectionRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
          boundingClientRect: { ...TEMPLATE_DOMRECT, width: 200, height: 200 },
        },
        false,
      ],
    ])(
      '%s',
      (
        _: string,
        expose: Partial<Configuration['expose']>,
        entry: Partial<IntersectionObserverEntry>,
        shouldPass: boolean
      ) => {
        expect(
          shouldTrackExpose(
            {
              ...TEMPLATE_CONFIG,
              expose: { ...TEMPLATE_CONFIG.expose, ...expose },
            },
            {
              ...TEMPLATE_INTERSECTION,
              ...entry,
            }
          )
        ).toBe(shouldPass);
      }
    );
  });
});
