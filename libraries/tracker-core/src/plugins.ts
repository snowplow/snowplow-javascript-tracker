import { SelfDescribingJson } from './core';

export interface ContextPlugin {
  getContexts?: () => SelfDescribingJson[];
}
