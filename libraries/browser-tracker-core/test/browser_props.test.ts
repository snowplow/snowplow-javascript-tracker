import { floorDimensionFields, getBrowserProperties } from '../src/helpers/browser_props';

describe('Browser props', () => {
  it('floorDimensionFields correctly floors dimension type values', () => {
    const testDimensions = '100x100';
    expect(floorDimensionFields(testDimensions)).toEqual(testDimensions);
  });

  it('floorDimensionFields correctly floors dimension type values with fractional numbers', () => {
    const testFractionalDimensions = '100.2x100.1';
    expect(floorDimensionFields(testFractionalDimensions)).toEqual('100x100');
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
