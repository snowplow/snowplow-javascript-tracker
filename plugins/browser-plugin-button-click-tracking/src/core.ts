import { PayloadBuilder, buildSelfDescribingEvent, removeEmptyProperties } from '@snowplow/tracker-core';
import { ButtonClickEvent } from './types';

/**
 * Build a Button Click Event
 * Used when a user clicks on a <button> tag on a webpage
 *
 * @param event - Contains the properties for the Button Click event
 * @returns PayloadBuilder to be sent to {@link @snowplow/tracker-core#TrackerCore.track}
 */
export function buildButtonClick(event: ButtonClickEvent): PayloadBuilder {
  const { label, id, classes, name } = event;
  const eventJson = {
    schema: 'iglu:com.snowplowanalytics.snowplow/button_click/jsonschema/1-0-0',
    data: removeEmptyProperties({ label, id, classes, name }),
  };

  return buildSelfDescribingEvent({ event: eventJson });
}
