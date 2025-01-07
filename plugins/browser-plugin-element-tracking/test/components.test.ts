import { baseComponentGenerator } from '../src/components';
import { Entities } from '../src/schemata';
import { Configuration } from '../src/configuration';

describe('component detection', () => {
  let container: HTMLElement;
  const config: Configuration = {
    name: 'template',
    selector: 'body',
    shadowOnly: false,
    component: true,
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

  beforeAll(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('no-ops without target element', () => {
    expect(baseComponentGenerator(true, [config])).toBeNull();
  });

  it('finds components from child target', () => {
    expect(baseComponentGenerator(false, [config], container)).toEqual({
      schema: Entities.COMPONENT_PARENTS,
      data: {
        component_list: [config.name],
      },
    });

    expect(baseComponentGenerator(true, [config], container)).toHaveLength(2);
  });
});
