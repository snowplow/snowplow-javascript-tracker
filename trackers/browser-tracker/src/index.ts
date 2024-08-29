/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  createSharedState,
  SharedState,
  addTracker,
  TrackerConfiguration,
  BrowserTracker,
  CookieSameSite,
  Platform,
  EventMethod,
  StateStorageStrategy,
  ClientSession,
  RequestFailure,
  EventBatch,
  ParsedIdCookie,
  PreservePageViewIdForUrl,
  EventStore,
  EventStoreIterator,
  EventStorePayload,
  EventStoreConfiguration,
  LocalStorageEventStoreConfigurationBase,
} from '@snowplow/browser-tracker-core';
import {
  version,
  CorePlugin,
  CorePluginConfiguration,
  TrackerCore,
  Timestamp,
  Payload,
  PayloadBuilder,
  Logger,
  EventJson,
  JsonProcessor,
  TrueTimestamp,
  DeviceTimestamp,
  EmitterConfigurationBase,
} from '@snowplow/tracker-core';

const state = typeof window !== 'undefined' ? createSharedState() : undefined;

/**
 * Initialise a new tracker
 *
 * @param trackerId - The tracker id - also known as tracker namespace
 * @param endpoint - Collector endpoint in the form collector.mysite.com
 * @param configuration - The initialisation options of the tracker
 */
export function newTracker(trackerId: string, endpoint: string, configuration?: TrackerConfiguration) {
  if (state) {
    return addTracker(trackerId, trackerId, `js-${version}`, endpoint, state, configuration);
  } else {
    return undefined;
  }
}

export {
  BrowserTracker,
  TrackerConfiguration,
  CookieSameSite,
  Platform,
  EventMethod,
  StateStorageStrategy,
  ClientSession,
  RequestFailure,
  EventBatch,
  ParsedIdCookie,
  PreservePageViewIdForUrl,
  EventStore,
  EventStoreIterator,
  EventStorePayload,
  EmitterConfigurationBase,
  LocalStorageEventStoreConfigurationBase,
  CorePlugin,
  CorePluginConfiguration,
  TrackerCore,
  SharedState,
  Timestamp,
  Payload,
  PayloadBuilder,
  Logger,
  EventStoreConfiguration,
  EventJson,
  JsonProcessor,
  TrueTimestamp,
  DeviceTimestamp,
};
export { version };
export * from './api';
