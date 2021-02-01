import { Core, Plugin } from '@snowplow/tracker-core';
import { determine } from 'jstimezonedetect';

export const TimezonePlugin = (): Plugin => {
  return {
    coreInit: (core: Core) => {
      core.setTimezone(determine(typeof Intl !== 'undefined').name());
    },
  };
};
