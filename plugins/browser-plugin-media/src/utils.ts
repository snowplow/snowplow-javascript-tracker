import { PayloadBuilder } from '@snowplow/tracker-core';

function getEventSchemaName(payloadBuilder: PayloadBuilder): string | undefined {
  const payloadJson = payloadBuilder.getJson();
  const mediaEventSchema = payloadJson.find(
    (e) =>
      e.keyIfEncoded === 'ue_px' &&
      (e.json.data as { schema: string }).schema.match(/iglu:com.snowplowanalytics.snowplow.media\/.*\/jsonschema/)
  );
  if (typeof mediaEventSchema === 'undefined') {
    return;
  }
  // We know schemas are in this otherwise it would not match the above regex.
  const eventSourceName = (mediaEventSchema.json.data as { schema: string }).schema.match(
    /iglu:com.snowplowanalytics.snowplow.media\/(.*)\/jsonschema/
  )![1];

  return eventSourceName;
}

function createEventSpecificationContext(eventSpecificationId: string) {
  return {
    schema: 'iglu:com.snowplowanalytics.snowplow/event_specification/jsonschema/1-0-0',
    data: {
      id: eventSpecificationId,
    },
  };
}

export function setEventSpecificationContext(
  payloadBuilder: PayloadBuilder,
  eventSpecificationIds?: Record<string, string>
) {
  if (!eventSpecificationIds) {
    return;
  }
  const eventName = getEventSchemaName(payloadBuilder);
  const eventSpecificationId = eventName && eventSpecificationIds[eventName];
  if (eventSpecificationId) {
    payloadBuilder.addContextEntity(createEventSpecificationContext(eventSpecificationId));
  }
}
