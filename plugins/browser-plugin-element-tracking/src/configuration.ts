import { type DataSelector, isDataSelector } from './data';
import type { OneOrMany, RequiredExcept } from './types';

export enum ConfigurationState {
  INITIAL,
  CONFIGURED,
  CREATED,
  DESTROYED,
  EXPOSED,
  OBSCURED,
}

enum Frequency {
  ALWAYS = 'always',
  ELEMENT = 'element',
  ONCE = 'once',
  NEVER = 'never',
  PAGEVIEW = 'pageview',
}

type BaseOptions = {
  when: `${Frequency}`;
  condition?: DataSelector;
};

type ExposeOptions = BaseOptions & {
  minPercentage?: number;
  minTimeMillis?: number;
  minSize?: number;
  boundaryPixels?: [number, number, number, number] | [number, number] | number;
};

export type ElementConfiguration = {
  name?: string;
  selector: string;
  create?: boolean | BaseOptions;
  destroy?: boolean | BaseOptions;
  expose?: boolean | ExposeOptions;
  obscure?: boolean | BaseOptions;
  aggregateStats?: boolean;
  component?: boolean;
  details?: OneOrMany<DataSelector>;
  contents?: OneOrMany<ElementConfiguration>;
  id?: string;
};

export type Configuration = Omit<
  RequiredExcept<ElementConfiguration, 'id'>,
  'create' | 'destroy' | 'expose' | 'obscure' | 'details' | 'contents'
> & {
  trackers?: string[];
  create: BaseOptions | null;
  destroy: BaseOptions | null;
  expose: RequiredExcept<ExposeOptions, 'condition'> | null;
  obscure: BaseOptions | null;
  state: ConfigurationState;
  details: DataSelector[];
  contents: Configuration[];
};

const DEFAULT_FREQUENCY_OPTIONS: BaseOptions = { when: 'always' };

export function checkConfig(config: ElementConfiguration, trackers?: string[]): Configuration {
  const { selector, name = selector, id, aggregateStats = false, component = false } = config;

  if (typeof name !== 'string' || !name) throw new Error(`Invalid element name value: ${name}`);
  if (typeof selector !== 'string' || !selector) throw new Error(`Invalid element selector value: ${selector}`);

  document.querySelector(config.selector); // this will throw if selector invalid

  const { create = false, destroy = false, expose = true, obscure = false } = config;

  const [validCreate, validDestroy, validObscure] = [create, destroy, obscure].map((input) => {
    if (!input) return null;
    if (typeof input === 'object') {
      const { when = 'never', condition } = input;

      if (condition && !isDataSelector(condition)) throw new Error('Invalid data selector provided for condition');

      if (when.toUpperCase() in Frequency) {
        return {
          when: when as Frequency,
          condition,
        };
      } else {
        throw new Error(`Unknown tracking frequency: ${when}`);
      }
    }
    return DEFAULT_FREQUENCY_OPTIONS;
  });

  let validExpose: RequiredExcept<ExposeOptions, 'condition'> | null = null;

  if (expose) {
    if (typeof expose === 'object') {
      const {
        when = 'never',
        condition,
        boundaryPixels = 0,
        minPercentage = 0,
        minSize = 0,
        minTimeMillis = 0,
      } = expose;

      if (condition && !isDataSelector(condition)) throw new Error('Invalid data selector provided for condition');
      if (
        typeof boundaryPixels !== 'number' ||
        typeof minPercentage !== 'number' ||
        typeof minSize !== 'number' ||
        typeof minTimeMillis !== 'number'
      )
        throw new Error('Invalid expose options provided');

      if (when.toUpperCase() in Frequency) {
        validExpose = {
          when: when as Frequency,
          condition,
          boundaryPixels,
          minPercentage,
          minSize,
          minTimeMillis,
        };
      } else {
        throw new Error(`Unknown tracking frequency: ${when}`);
      }
    } else {
      validExpose = {
        ...DEFAULT_FREQUENCY_OPTIONS,
        boundaryPixels: 0,
        minPercentage: 0,
        minSize: 0,
        minTimeMillis: 0,
      };
    }
  }

  let { details = [], contents = [] } = config;

  if (!Array.isArray(details)) details = details == null ? [] : [details];
  if (!Array.isArray(contents)) contents = contents == null ? [] : [contents];

  return {
    name,
    selector,
    id,
    create: validCreate,
    destroy: validDestroy,
    expose: validExpose,
    obscure: validObscure,
    aggregateStats: !!aggregateStats,
    component: !!component,
    details,
    contents: contents.map((inner) => checkConfig(inner, trackers)),
    trackers,
    state: ConfigurationState.INITIAL,
  };
}
