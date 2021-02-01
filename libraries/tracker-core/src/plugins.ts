import { Core, SelfDescribingJson } from './core';
import { Payload, PayloadBuilder } from './payload';

export interface Plugin {
  coreInit?: (core: Core) => void;
  beforeTrack?: (payloadBuilder: PayloadBuilder) => void;
  afterTrack?: (payload: Payload) => void;
  contexts?: () => SelfDescribingJson[];
}
