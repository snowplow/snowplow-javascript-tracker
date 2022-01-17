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

import { TrackerCore, SelfDescribingJson } from './core';
import { Logger } from './logger';
import { Payload, PayloadBuilder } from './payload';

/**
 * Interface which defines Core Plugins
 */
export interface CorePlugin {
  /**
   * Called when the plugin is initialised during the trackerCore construction
   *
   * @remarks
   * Use to capture the specific core instance for each instance of a core plugin
   */
  activateCorePlugin?: (core: TrackerCore) => void;
  /**
   * Called just before the trackerCore callback fires
   * @param payloadBuilder - The payloadBuilder which will be sent to the callback, can be modified
   */
  beforeTrack?: (payloadBuilder: PayloadBuilder) => void;
  /**
   * Called just after the trackerCore callback fires
   * @param payload - The final built payload
   */
  afterTrack?: (payload: Payload) => void;
  /**
   * Called when constructing the context for each event
   * Useful for adding additional context to events
   */
  contexts?: () => SelfDescribingJson[];
  /**
   * Passed a logger instance which can be used to send log information
   * to the active logger
   */
  logger?: (logger: Logger) => void;
}
