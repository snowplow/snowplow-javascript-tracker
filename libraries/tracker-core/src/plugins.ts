import { TrackerCore, SelfDescribingJson } from './core';
import { Payload, PayloadBuilder } from './payload';

export interface CorePlugin {
  activateCorePlugin?: (core: TrackerCore) => void;
  beforeTrack?: (payloadBuilder: PayloadBuilder) => void;
  afterTrack?: (payload: Payload) => void;
  contexts?: () => SelfDescribingJson[];
}
