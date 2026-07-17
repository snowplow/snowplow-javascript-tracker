import { makeDimension, getBrowserProperties } from '../src/helpers/browser_props';

describe('Browser props', () => {
  it('makeDimension correctly floors dimension type values', () => {
    const testDimensions = '100x100';
    expect(makeDimension(100, 100)).toEqual(testDimensions);
  });

  it('makeDimension correctly floors dimension type values with fractional numbers', () => {
    expect(makeDimension(100.2, 100.1)).toEqual('100x100');
  });

  it('makeDimension correctly drops invalid values', () => {
    expect(makeDimension(undefined as any, 100.1)).toEqual(null);
    expect(makeDimension(NaN, 1)).toEqual(null);
  });

  describe('#getBrowserProperties', () => {
    describe('with undefined document', () => {
      beforeAll(() => {
        // @ts-expect-error
        document = undefined;
      });

      it('does not invoke the resize observer if the document is null', () => {
        const browserProperties = getBrowserProperties();
        expect(browserProperties).not.toEqual(null);
      });
    });
  });

  describe('ResizeObserver entry size caching', () => {
    function makeContentRect(width: number, height: number): DOMRectReadOnly {
      return {
        x: 0,
        y: 0,
        width,
        height,
        top: 0,
        right: width,
        bottom: height,
        left: 0,
        toJSON: () => ({}),
      } as DOMRectReadOnly;
    }

    function makeEntry(
      target: Element,
      width: number,
      height: number,
      includeBorderBoxSize = true
    ): ResizeObserverEntry {
      return {
        target,
        contentRect: makeContentRect(width, height),
        borderBoxSize: includeBorderBoxSize
          ? ([{ inlineSize: width, blockSize: height }] as unknown as ReadonlyArray<ResizeObserverSize>)
          : (undefined as any),
        contentBoxSize: [{ inlineSize: width, blockSize: height }] as unknown as ReadonlyArray<ResizeObserverSize>,
        devicePixelContentBoxSize: [] as unknown as ReadonlyArray<ResizeObserverSize>,
      };
    }

    it('uses borderBoxSize from ResizeObserver entries for document size', () => {
      let capturedCallback: ResizeObserverCallback | undefined;
      const origRO = (global as any).ResizeObserver;

      jest.useFakeTimers();
      jest.isolateModules(() => {
        (global as any).ResizeObserver = class {
          constructor(cb: ResizeObserverCallback) {
            capturedCallback = cb;
          }
          observe = jest.fn();
          disconnect = jest.fn();
        };

        const { getBrowserProperties: freshGetBrowserProperties } = require('../src/helpers/browser_props');

        // Initial call sets up ResizeObserver
        freshGetBrowserProperties();
        expect(capturedCallback).toBeDefined();

        // Simulate ResizeObserver firing: body=900x2000, documentElement=1440x900
        capturedCallback!(
          [makeEntry(document.body, 900, 2000), makeEntry(document.documentElement, 1440, 900)],
          {} as ResizeObserver
        );

        // Run the scheduled requestAnimationFrame
        jest.runAllTimers();

        const props = freshGetBrowserProperties();
        // Width: max(1440, 900) = 1440; Height: max(900, 2000) = 2000
        expect(props.documentSize).toBe('1440x2000');
      });

      (global as any).ResizeObserver = origRO;
      jest.useRealTimers();
    });

    it('falls back to contentRect when borderBoxSize is absent', () => {
      let capturedCallback: ResizeObserverCallback | undefined;
      const origRO = (global as any).ResizeObserver;

      jest.useFakeTimers();
      jest.isolateModules(() => {
        (global as any).ResizeObserver = class {
          constructor(cb: ResizeObserverCallback) {
            capturedCallback = cb;
          }
          observe = jest.fn();
          disconnect = jest.fn();
        };

        const { getBrowserProperties: freshGetBrowserProperties } = require('../src/helpers/browser_props');

        freshGetBrowserProperties();

        capturedCallback!(
          [makeEntry(document.body, 600, 1500, false), makeEntry(document.documentElement, 1280, 800, false)],
          {} as ResizeObserver
        );

        jest.runAllTimers();

        const props = freshGetBrowserProperties();
        // Width: max(1280, 600) = 1280; Height: max(800, 1500) = 1500
        expect(props.documentSize).toBe('1280x1500');
      });

      (global as any).ResizeObserver = origRO;
      jest.useRealTimers();
    });

    it('does not read layout properties once ResizeObserver sizes are cached', () => {
      let capturedCallback: ResizeObserverCallback | undefined;
      const origRO = (global as any).ResizeObserver;
      const docEl = document.documentElement;
      const body = document.body;
      const originalDescriptors = {
        bodyOffsetHeight: Object.getOwnPropertyDescriptor(body, 'offsetHeight'),
        bodyScrollHeight: Object.getOwnPropertyDescriptor(body, 'scrollHeight'),
        docClientWidth: Object.getOwnPropertyDescriptor(docEl, 'clientWidth'),
        docOffsetWidth: Object.getOwnPropertyDescriptor(docEl, 'offsetWidth'),
        docScrollWidth: Object.getOwnPropertyDescriptor(docEl, 'scrollWidth'),
        docClientHeight: Object.getOwnPropertyDescriptor(docEl, 'clientHeight'),
        docOffsetHeight: Object.getOwnPropertyDescriptor(docEl, 'offsetHeight'),
        docScrollHeight: Object.getOwnPropertyDescriptor(docEl, 'scrollHeight'),
      };

      const throwIfRead = () => {
        throw new Error('layout property read');
      };

      const restoreDescriptor = (target: object, key: string, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
          Object.defineProperty(target, key, descriptor);
        } else {
          delete (target as Record<string, unknown>)[key];
        }
      };

      jest.useFakeTimers();
      try {
        jest.isolateModules(() => {
          (global as any).ResizeObserver = class {
            constructor(cb: ResizeObserverCallback) {
              capturedCallback = cb;
            }
            observe = jest.fn();
            disconnect = jest.fn();
          };

          const { getBrowserProperties: freshGetBrowserProperties } = require('../src/helpers/browser_props');

          freshGetBrowserProperties();

          capturedCallback!(
            [makeEntry(document.body, 900, 2000), makeEntry(document.documentElement, 1440, 900)],
            {} as ResizeObserver
          );

          jest.runAllTimers();

          Object.defineProperty(body, 'offsetHeight', { configurable: true, get: throwIfRead });
          Object.defineProperty(body, 'scrollHeight', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'clientWidth', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'offsetWidth', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'scrollWidth', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'clientHeight', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'offsetHeight', { configurable: true, get: throwIfRead });
          Object.defineProperty(docEl, 'scrollHeight', { configurable: true, get: throwIfRead });

          expect(() => freshGetBrowserProperties()).not.toThrow();
        });
      } finally {
        restoreDescriptor(body, 'offsetHeight', originalDescriptors.bodyOffsetHeight);
        restoreDescriptor(body, 'scrollHeight', originalDescriptors.bodyScrollHeight);
        restoreDescriptor(docEl, 'clientWidth', originalDescriptors.docClientWidth);
        restoreDescriptor(docEl, 'offsetWidth', originalDescriptors.docOffsetWidth);
        restoreDescriptor(docEl, 'scrollWidth', originalDescriptors.docScrollWidth);
        restoreDescriptor(docEl, 'clientHeight', originalDescriptors.docClientHeight);
        restoreDescriptor(docEl, 'offsetHeight', originalDescriptors.docOffsetHeight);
        restoreDescriptor(docEl, 'scrollHeight', originalDescriptors.docScrollHeight);
        (global as any).ResizeObserver = origRO;
        jest.useRealTimers();
      }
    });
  });
});
