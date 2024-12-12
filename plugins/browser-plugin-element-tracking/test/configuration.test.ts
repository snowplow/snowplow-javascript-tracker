import {
  Configuration,
  type ContextProvider,
  ElementConfiguration,
  checkConfig,
  createContextMerger,
} from '../src/configuration';

describe('configuration parsing', () => {
  const emptyMerger = createContextMerger();

  // Accept valid configs
  it.each<{ note: string; input: ElementConfiguration; expected?: Partial<Configuration> }>([
    {
      note: 'minimal configuration',
      input: { selector: '.oncreate' },
    },
    {
      note: 'use selector when no name',
      input: { selector: 'unnamed' },
      expected: { selector: 'unnamed', name: 'unnamed' },
    },
    {
      note: 'custom name',
      input: { selector: '.selector', name: 'named' },
      expected: { selector: '.selector', name: 'named' },
    },
    {
      note: 'default event frequencies',
      input: { selector: 'unnamed' },
      expected: {
        create: { when: 'never' },
        destroy: { when: 'never' },
        expose: { when: 'always', boundaryPixels: 0, minPercentage: 0, minSize: 0, minTimeMillis: 0 },
        obscure: { when: 'never' },
        component: false,
        contents: [],
        details: [],
      },
    },
    {
      note: 'custom frequencies',
      input: { selector: 'unnamed', expose: false, create: true },
      expected: {
        create: { when: 'always' },
        expose: { when: 'never', boundaryPixels: 0, minPercentage: 0, minSize: 0, minTimeMillis: 0 },
      },
    },
    {
      note: 'mis-cased frequencies',
      input: { selector: 'unnamed', create: { when: 'ALWAYs' as any }, expose: { when: 'Never' as any } },
      expected: {
        create: { when: 'always' },
        expose: { when: 'never' } as any,
      },
    },
    {
      note: 'context provider',
      input: { selector: 'unnamed', context: [] },
      expected: {
        context: emptyMerger as Extract<ContextProvider, Function>,
      },
    },
    {
      note: 'contents recursion',
      input: { selector: 'unnamed', contents: { selector: 'inner' } },
    },
  ])('accepts valid config: $note', ({ input, expected }) => {
    const result = checkConfig(input, emptyMerger, true, true);
    expect(result).toBeDefined();
    if (expected) expect(result).toMatchObject(expected);
  });

  // Reject invalid configs
  it.each<{ note: string; input: ElementConfiguration }>([
    {
      note: 'invalid name',
      input: { selector: 'a', name: '' },
    },
    {
      note: 'empty selector',
      input: { selector: '' },
    },
    {
      note: 'invalid selector',
      input: { selector: ':asdf' },
    },
    {
      note: 'mistyped selector',
      input: { selector: 1 as any },
    },
    {
      note: 'good name, bad selector',
      input: { selector: '', name: 'named' },
    },
    {
      note: 'bad expose condition',
      input: { selector: '.good', name: 'named', expose: { condition: {} } as any },
    },
    {
      note: 'bad other condition',
      input: { selector: '.good', name: 'named', create: { condition: true } as any },
    },
    {
      note: 'bad expose frequency',
      input: { selector: '.good', name: 'named', expose: { when: 'fail' } },
    },
    {
      note: 'bad other frequency',
      input: { selector: '.good', name: 'named', create: { when: 'fail' } },
    },
    {
      note: 'bad boundaries',
      input: { selector: '.good', name: 'named', expose: { when: 'always', boundaryPixels: '1em' } },
    },
    {
      note: 'bad details request',
      input: { selector: '.good', name: 'named', details: {} as any },
    },
  ])('rejects invalid config: $note', ({ input }) => {
    expect.hasAssertions();
    try {
      checkConfig(input, emptyMerger, true, true);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
