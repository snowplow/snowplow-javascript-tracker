import { parallel } from 'gulp';
import { iife, esm, cjs } from './build';
import { pullSnowplowMicro, buildTestDetectors, buildTestHelpers, buildTestSnowplow } from './test';

export const buildIife = iife;
export const buildEsm = esm;
export const buildCjs = cjs;

export const build = parallel(iife, esm, cjs);
export const buildForIntegrationTest = parallel(
  pullSnowplowMicro,
  buildTestDetectors,
  buildTestHelpers,
  buildTestSnowplow
);

export default build;
