import { defineBoundaries, getMatchingElements, nodeIsElement } from '../src/util';
import { Configuration } from '../src/configuration';

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
});
