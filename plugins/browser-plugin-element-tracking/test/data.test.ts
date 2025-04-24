import { evaluateDataSelector, extractSelectorDetails, isDataSelector } from '../src/data';
import type { DataSelector } from '../src/types';

describe('DataSelector behavior', () => {
  const fake_selector = 'css_path_val';
  let elem: HTMLDivElement;

  beforeAll(() => {
    // sample element we'll be selecting from
    elem = document.createElement('div');

    elem.textContent = 'text_content_val\n';
    elem.setAttribute('id', 'id_attr');
    elem.className = 'class_prop';
    elem.dataset.dsAttr = 'ds_val';

    const child = document.createElement('span');
    child.textContent = 'child_text_val';
    elem.appendChild(child);
  });

  it.each([
    ['attributes', ['id'], 'id_attr'],
    ['properties', ['className'], 'class_prop'],
    ['dataset', ['dsAttr'], 'ds_val'],
    ['child_text', { inner: 'span' }, 'child_text_val'],
    ['content', { inner: 'text_content\\S+' }, 'text_content_val'],
    ['selector', true, fake_selector],
  ])('extracts %p', (source, params, value) => {
    const selector = { [source]: params } as DataSelector;
    expect(isDataSelector(selector)).toBe(true);

    const result = evaluateDataSelector(elem, fake_selector, selector);

    const expected = Array.isArray(params) ? params : params === true ? [source] : Object.keys(params);

    expect(result).toEqual(
      expected.map((attribute) => ({
        source,
        attribute,
        value,
      }))
    );
  });

  it('handles callbacks', () => {
    const sel = jest.fn().mockReturnValueOnce({ attribute: 'value', complex: { nested: 'data' } });

    expect(isDataSelector(sel)).toBe(true);

    const result = evaluateDataSelector(elem, fake_selector, sel);

    expect(sel).toBeCalledWith(elem);
    expect(result).toEqual([
      {
        source: 'callback',
        attribute: 'attribute',
        value: 'value',
      },
      {
        source: 'callback',
        attribute: 'complex',
        value: '{"nested":"data"}',
      },
    ]);
  });

  it('handles callback failures', () => {
    const sel = jest.fn<Record<string, string>, Element[]>(() => {
      throw new Error('deliberate failure');
    });

    expect(isDataSelector(sel)).toBe(true);

    const result = evaluateDataSelector(elem, fake_selector, sel);

    expect(sel).toBeCalledWith(elem);
    expect(result).toEqual([
      {
        source: 'error',
        attribute: 'message',
        value: 'deliberate failure',
      },
    ]);
  });

  it('flattens correctly', () => {
    const result = extractSelectorDetails(elem, fake_selector, [
      { attributes: ['id'] },
      { properties: ['className'] },
      { properties: ['DOES_NOT_EXIST'] },
    ]);

    expect(result).toHaveLength(2);
  });

  it('doesnt mix properties and attributes', () => {
    const result = evaluateDataSelector(elem, fake_selector, {
      attributes: ['className', 'class'],
      properties: ['className', 'class'],
    });

    expect(result).toHaveLength(2);

    expect(result).toContainEqual({
      source: 'properties',
      attribute: 'className',
      value: 'class_prop',
    });

    expect(result).toContainEqual({
      source: 'attributes',
      attribute: 'class',
      value: 'class_prop',
    });
  });

  it('produces successful matches', () => {
    const result = evaluateDataSelector(elem, fake_selector, {
      attributes: ['id'],
      match: { id: 'id_attr' },
    });

    expect(result).toHaveLength(1);
  });

  it('filters unsuccessful matches', () => {
    const result = evaluateDataSelector(elem, fake_selector, {
      attributes: ['id'],
      match: { id: 'NOT_REAL_VALUE' },
    });

    expect(result).toHaveLength(0);
  });

  it.each([null, {}, { notASelector: [] }])('ignores empty: %j', (invalid) => {
    expect(isDataSelector(invalid)).toBe(false);
  });
});
