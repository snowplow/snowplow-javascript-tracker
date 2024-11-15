import type { SelfDescribingJson } from '@snowplow/tracker-core';

import { type DataSelector, isDataSelector } from './data';
import type { OneOrMany, RequiredExcept } from './types';

export enum ConfigurationState {
  INITIAL,
  CONFIGURED,
}

export type ContextProvider =
  | SelfDescribingJson[]
  | ((element: Element | HTMLElement | undefined, match: Configuration) => SelfDescribingJson[]);

export enum Frequency {
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
  component?: boolean;
  details?: OneOrMany<DataSelector>;
  contents?: OneOrMany<ElementConfiguration>;
  context?: ContextProvider;
  id?: string;
};

export type Configuration = Omit<
  RequiredExcept<ElementConfiguration, 'id'>,
  'create' | 'destroy' | 'expose' | 'obscure' | 'details' | 'contents'
> & {
  trackers?: string[];
  create: BaseOptions;
  destroy: BaseOptions;
  expose: RequiredExcept<ExposeOptions, 'condition'>;
  obscure: BaseOptions;
  state: ConfigurationState;
  details: DataSelector[];
  contents: Configuration[];
  context: Extract<ContextProvider, Function>;
};

const DEFAULT_FREQUENCY_OPTIONS: BaseOptions = { when: 'always' };

const emptyProvider: ContextProvider = () => [];

export function checkConfig(
  config: ElementConfiguration,
  contextProvider: ContextProvider,
  trackers?: string[]
): Configuration {
  const { selector, name = selector, id, component = false } = config;

  if (typeof name !== 'string' || !name) throw new Error(`Invalid element name value: ${name}`);
  if (typeof selector !== 'string' || !selector) throw new Error(`Invalid element selector value: ${selector}`);

  document.querySelector(config.selector); // this will throw if selector invalid

  const { create = false, destroy = false, expose = true, obscure = false } = config;

  const [validCreate, validDestroy, validObscure] = [create, destroy, obscure].map((input) => {
    if (!input) return { when: Frequency.NEVER };
    if (typeof input === 'object') {
      const { when = 'always', condition } = input;

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

  if (expose && typeof expose === 'object') {
    const {
      when = 'always',
      condition,
      boundaryPixels = 0,
      minPercentage = 0,
      minSize = 0,
      minTimeMillis = 0,
    } = expose;

    if (condition && !isDataSelector(condition)) throw new Error('Invalid data selector provided for condition');
    if (
      (typeof boundaryPixels !== 'number' && !Array.isArray(boundaryPixels)) ||
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
  } else if (expose) {
    validExpose = {
      ...DEFAULT_FREQUENCY_OPTIONS,
      boundaryPixels: 0,
      minPercentage: 0,
      minSize: 0,
      minTimeMillis: 0,
    };
  } else {
    validExpose = {
      when: Frequency.NEVER,
      boundaryPixels: 0,
      minPercentage: 0,
      minSize: 0,
      minTimeMillis: 0,
    };
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
    component: !!component,
    details,
    contents: contents.map((inner) => checkConfig(inner, inner.context ?? emptyProvider, trackers)),
    context: typeof contextProvider === 'function' ? contextProvider : () => contextProvider,
    trackers,
    state: ConfigurationState.INITIAL,
  };
}
