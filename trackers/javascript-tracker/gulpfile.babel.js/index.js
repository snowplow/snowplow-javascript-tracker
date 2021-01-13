import { parallel } from 'gulp';
import { pullSnowplowMicro, buildTestSnowplow } from './test';

export const buildForIntegrationTest = parallel(pullSnowplowMicro, buildTestSnowplow);

export default buildForIntegrationTest;
