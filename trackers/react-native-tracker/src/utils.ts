import { PayloadBuilder } from '@snowplow/tracker-core';

// Returns the "useful" schema, i.e. what would someone want to use to identify events.
// For some events this is the 'e' property but for unstructured events, this is the
// 'schema' from the 'ue_px' field.
export function getUsefulSchema(sb: PayloadBuilder): string {
  let eventJson = sb.getJson();
  for (const json of eventJson) {
    if (json.keyIfEncoded === 'ue_px' && typeof json.json['data'] === 'object') {
      const schema = (json.json['data'] as Record<string, unknown>)['schema'];
      if (typeof schema == 'string') {
        return schema;
      }
    }
  }
  return '';
}