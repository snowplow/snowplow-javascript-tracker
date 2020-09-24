import { parallel } from 'gulp';
import { buildSp } from './iife';
import { pullSnowplowMicro, buildTestDetectors, buildTestHelpers, buildTestSnowplow } from './test';

export const build = buildSp;
export const testEndToEnd = parallel(pullSnowplowMicro, buildTestDetectors, buildTestHelpers, buildTestSnowplow);

export default buildSp;
