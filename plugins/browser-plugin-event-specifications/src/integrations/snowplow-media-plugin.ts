import { PayloadBuilder } from '@snowplow/tracker-core';
import { Integration } from './index';

export const snowplowMediaPluginIntegration: Integration = {
  detectMatchingEvent(payloadBuilder) {
    return getMediaEventSchemaName(payloadBuilder);
  },
};

function getMediaEventSchemaName(payloadBuilder: PayloadBuilder): string | undefined {
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
