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
});
