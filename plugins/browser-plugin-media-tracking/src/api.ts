import { Logger } from '@snowplow/tracker-core';
import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { waitForElement } from './findElem';
import { Config, isElementConfig, isStringConfig } from './config';
import { setUpListeners } from './player';
import { setConfigDefaults } from './helperFunctions';

// These imports are used for documentation purposes only.
// Typescript complains that they are unused.
// @ts-ignore: TS6133
import { DynamicContext } from '@snowplow/tracker-core';
// @ts-ignore: TS6133
import { HTML5MediaEventTypes } from './config';
// @ts-ignore: TS6133
import { FilterOutRepeatedEvents } from '@snowplow/browser-plugin-media/src/types';

import { endMediaTracking, SnowplowMediaPlugin } from '@snowplow/browser-plugin-media';

let LOG: Logger;

export function MediaTrackingPlugin(): BrowserPlugin {
  return {
    ...SnowplowMediaPlugin(),
    logger: (logger) => {
      LOG = logger;
    },
  };
}

/**
 * Enables media tracking on an HTML `<video>` or `<audio>` element.
 *
 * @param {Config} config - Configuration options for media tracking.
 *
 * **Required:**
 * - `config.id` (`string`): The session ID. Must be unique for each media element. Used to identify the media session and end tracking.
 * - `config.video` (string | HTMLMediaElement): The ID of the media element or the element itself.
 *
 * **Optional:**
 * - `config.label` (`string`): A human-readable label for the media element.
 * - `config.captureEvents` {@link HTML5MediaEventTypes}: A list of media events to track. All events are tracked by default.
 * - `config.boundaries` (`number[]`): Percentage thresholds (0-100) at which to trigger progress events. Disabled by default.
 * - `config.context` {@link DynamicContext}: Contexts to attach to each tracking event.
 *
 * **Ping Configuration (Optional):**
 * - `config.pings.pingInterval` (`number`): The interval (in seconds) for sending ping events. Default is 30(s).
 * - `config.pings.maxPausedPings` (`number`): The maximum number of ping events sent while playback is paused. Default is 1.
 *
 * **Other Options (Optional):**
 * - `config.updatePageActivityWhilePlaying` (`boolean`): Whether to update page activity while media is playing. Enabled by default.
 * - `config.filterOutRepeatedEvents` {@link FilterOutRepeatedEvents}: Whether to suppress consecutive identical events. Default is false.
 */
export function startHtml5MediaTracking(config: Config) {
  if (!config.video) {
    LOG.error(
      "Missing 'video' property in the enableMediaTracking configuration. ",
      "Ensure the 'config.video' property is correctly set. Current config: ",
      config
    );
    return;
  }

  config = setConfigDefaults(config);

  if (isStringConfig(config)) {
    waitForElement(config, setUpListeners);
  } else if (isElementConfig(config)) {
    setUpListeners(config);
  }
}

/**
 * Ends media tracking with the given ID if previously started. Clears local state for the media tracking and sends any events waiting to be sent.
 *
 * @param {string} id - The session ID.
 */
export function endHtml5MediaTracking(id: string) {
  endMediaTracking({ id });
}
