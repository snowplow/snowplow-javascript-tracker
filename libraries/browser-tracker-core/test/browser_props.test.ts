import { makeDimension, getBrowserProperties, resetBrowserPropertiesState } from '../src/helpers/browser_props';

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
    describe('caching behavior (modern browsers with ResizeObserver)', () => {
      let savedResizeObserver: any;

      beforeEach(() => {
        savedResizeObserver = (window as any).ResizeObserver;
        // Provide a minimal ResizeObserver so the caching path is exercised
        (window as any).ResizeObserver = class MockResizeObserver {
          constructor(_cb: ResizeObserverCallback) {}
          observe() {}
          unobserve() {}
          disconnect() {}
        };
        resetBrowserPropertiesState();
      });

      afterEach(() => {
        (window as any).ResizeObserver = savedResizeObserver;
        resetBrowserPropertiesState();
        jest.restoreAllMocks();
      });

      it('returns the same cached reference on successive calls', () => {
        const first = getBrowserProperties();
        const second = getBrowserProperties();
        expect(second).toBe(first);
      });

      it('reset clears the cache so the next call re-reads browser properties', () => {
        getBrowserProperties();
        resetBrowserPropertiesState();
        const fresh = getBrowserProperties();
        expect(fresh).toBeDefined();
        expect(fresh.cookiesEnabled).toBeDefined();
      });

      it('rAF callback triggered by ResizeObserver updates cachedProperties', () => {
        let capturedResizeCallback: ResizeObserverCallback | undefined;
        let capturedRafCallback: FrameRequestCallback | undefined;

        // Override the mock to capture the ResizeObserver callback so we can trigger it manually
        (window as any).ResizeObserver = class CaptureResizeObserver {
          constructor(cb: ResizeObserverCallback) {
            capturedResizeCallback = cb;
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        };
        resetBrowserPropertiesState();

        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
          capturedRafCallback = cb;
          return 1;
        });

        const first = getBrowserProperties(); // populates cache + wires up ResizeObserver

        // Trigger the ResizeObserver callback to schedule a rAF
        expect(capturedResizeCallback).toBeDefined();
        capturedResizeCallback!([], {} as ResizeObserver);
        expect(capturedRafCallback).toBeDefined();

        // rAF has been scheduled but not yet fired — cache still holds the original value
        const beforeRaf = getBrowserProperties();
        expect(beforeRaf).toBe(first);

        // Fire the rAF callback to simulate the cache update
        capturedRafCallback!(performance.now());

        // Cache was refreshed by the rAF callback
        const afterRaf = getBrowserProperties();
        expect(afterRaf).toBeDefined();
      });
    });

    describe('old-browser fallback (no ResizeObserver)', () => {
      let savedResizeObserver: any;

      beforeEach(() => {
        savedResizeObserver = (window as any).ResizeObserver;
        delete (window as any).ResizeObserver;
        resetBrowserPropertiesState();
      });

      afterEach(() => {
        (window as any).ResizeObserver = savedResizeObserver;
        resetBrowserPropertiesState();
      });

      it('calls readBrowserProperties on every invocation — no caching', () => {
        const first = getBrowserProperties();
        const second = getBrowserProperties();
        // Without ResizeObserver caching each call returns a fresh object
        expect(second).not.toBe(first);
      });
    });

    describe('with undefined document', () => {
      let originalDocument: typeof document;
      let savedResizeObserver: any;

      beforeAll(() => {
        originalDocument = document;
        savedResizeObserver = (window as any).ResizeObserver;

        // Ensure the caching path is taken so initializeResizeObserver() guards against undefined document
        (window as any).ResizeObserver = class MockResizeObserver {
          constructor(_cb: ResizeObserverCallback) {}
          observe() {}
          unobserve() {}
          disconnect() {}
        };

        // Pre-populate cache while document is still available
        resetBrowserPropertiesState();
        getBrowserProperties();

        // @ts-expect-error
        document = undefined;
      });

      afterAll(() => {
        document = originalDocument;
        (window as any).ResizeObserver = savedResizeObserver;
        resetBrowserPropertiesState();
      });

      it('does not invoke the resize observer if the document is null', () => {
        const browserProperties = getBrowserProperties();
        expect(browserProperties).not.toEqual(null);
      });
    });
  });
});
