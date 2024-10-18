/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
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

import { trackerCore, PayloadBuilder, TrackerCore, version } from '@snowplow/tracker-core';

import { Emitter, newEmitter, EmitterConfiguration } from '@snowplow/tracker-core';

export interface Tracker extends TrackerCore {
  /**
   * Set the domain user ID
   *
   * @param userId - The domain user id
   */
  setDomainUserId: (userId: string) => void;

  /**
   * Set the network user ID
   *
   * @param userId - The network user id
   */
  setNetworkUserId: (userId: string) => void;

  /**
   * Set the session ID (`domain_sessionid` in the atomic events)
   *
   * @param sessionId - The session id
   */
  setSessionId: (sessionId: string) => void;

  /**
   * Set the session index (`domain_sessionidx` in the atomic events)
   *
   * @param sessionIndex - The session index
   */
  setSessionIndex: (sessionIndex: string | number) => void;

  /**
   * Calls flush on all emitters in order to send all queued events to the collector
   * @returns Promise<void> - Promise that resolves when all emitters have flushed
   */
  flush: () => Promise<void>;
}

export interface TrackerConfiguration {
  /* The namespace of the tracker */
  namespace: string;
  /* The application ID */
  appId: string;
  /**
   * Whether unstructured events and custom contexts should be base64 encoded.
   * @defaultValue true
   **/
  encodeBase64?: boolean;
}

export type CustomEmitter = {
  /* Function returning custom Emitter or Emitter[] to be used. If set, other options are irrelevant */
  customEmitter: () => Emitter | Array<Emitter>;
};

export type NodeEmitterConfiguration = CustomEmitter | EmitterConfiguration;

/**
 * Updates the defaults for the emitter configuration
 */
function newNodeEmitters(configuration: NodeEmitterConfiguration): Emitter[] {
  if (configuration.hasOwnProperty('customEmitter')) {
    const customEmitters = (configuration as CustomEmitter).customEmitter();
    return Array.isArray(customEmitters) ? customEmitters : [customEmitters];
  } else {
    configuration = configuration as EmitterConfiguration;
    // Set the default buffer size to 10 instead of 1
    if (configuration.bufferSize === undefined) {
      configuration.bufferSize = 10;
    }
    return [newEmitter(configuration)];
  }
}

export function newTracker(
  trackerConfiguration: TrackerConfiguration,
  emitterConfiguration: NodeEmitterConfiguration | NodeEmitterConfiguration[]
): Tracker {
  const { namespace, appId, encodeBase64 = true } = trackerConfiguration;

  const configs = Array.isArray(emitterConfiguration) ? emitterConfiguration : [emitterConfiguration];
  const allEmitters = configs.flatMap(newNodeEmitters);

  let domainUserId: string;
  let networkUserId: string;
  let sessionId: string;
  let sessionIndex: string | number;

  const addUserInformation = (payload: PayloadBuilder): void => {
    payload.add('duid', domainUserId);
    payload.add('nuid', networkUserId);
    payload.add('sid', sessionId);
    payload.add('vid', sessionIndex && Number(sessionIndex));
  };

  /**
   * Send the payload for an event to the endpoint
   *
   * @param payload - Dictionary of name-value pairs for the querystring
   */
  const sendPayload = (payload: PayloadBuilder): void => {
    addUserInformation(payload);
    const builtPayload = payload.build();
    for (let i = 0; i < allEmitters.length; i++) {
      allEmitters[i].input(builtPayload);
    }
  };

  const core = trackerCore({ base64: encodeBase64, callback: sendPayload });

  core.setPlatform('srv'); // default platform
  core.setTrackerVersion('node-' + version);
  core.setTrackerNamespace(namespace);
  core.setAppId(appId);

  const setDomainUserId = function (userId: string) {
    domainUserId = userId;
  };

  const setNetworkUserId = function (userId: string) {
    networkUserId = userId;
  };

  const setSessionId = function (currentSessionId: string) {
    sessionId = currentSessionId;
  };

  const setSessionIndex = function (currentSessionIndex: string | number) {
    sessionIndex = currentSessionIndex;
  };

  const flush = () => {
    return Promise.allSettled(allEmitters.map((emitter) => emitter.flush())).then(() => {});
  }

  return {
    setDomainUserId,
    setNetworkUserId,
    setSessionId,
    setSessionIndex,
    flush,
    ...core,
  };
}
