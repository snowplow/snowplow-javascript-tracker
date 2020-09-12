/*
 * JavaScript tracker for Snowplow: tests/unit/in_queue.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { InQueueManager } from '../../src/js/in_queue'

describe('InQueueManager', () => {
  let output = 0

  function mockTrackerConstructor(
    functionName,
    namespace,
    version,
    mutSnowplowState,
    argmap
  ) {
    var configCollectorUrl,
      attribute = 10

    return {
      setCollectorUrl: function(rawUrl) {
        configCollectorUrl = 'http://' + rawUrl + '/i'
      },
      increaseAttribute: function(n) {
        attribute += n
      },
      setAttribute: function(p) {
        attribute = p
      },
      setOutputToAttribute: function() {
        output = attribute
      },
      addAttributeToOutput: function() {
        output += attribute
      },
    }
  }

  const asyncQueueOps = [
    ['newTracker', 'firstTracker', 'firstEndpoint'],
    ['increaseAttribute', 5],
    ['setOutputToAttribute'],
  ]
  const asyncQueue = new InQueueManager(
    mockTrackerConstructor,
    0,
    {},
    asyncQueueOps,
    'snowplow'
  )

  it('Make a proxy, Function originally stored in asyncQueue is executed when asyncQueue becomes an AsyncQueueProxy', () => {
    expect(output).toEqual(15)
  })

  it('Add to asyncQueue after conversion, Function added to asyncQueue after it becomes an AsyncQueueProxy is executed', () => {
    asyncQueue.push(['setAttribute', 7])
    asyncQueue.push(['setOutputToAttribute'])
    expect(output).toEqual(7)
  })

  it("Backward compatibility: Create a tracker using the legacy setCollectorUrl method, A second tracker is created and both trackers' attributes are added to output", () => {
    asyncQueue.push(['setCollectorUrl', 'secondEndpoint'])
    asyncQueue.push(['addAttributeToOutput'])
    expect(output).toEqual(24)
  })

  it("Use 'function:tracker1;tracker2' syntax to control which trackers execute which functions, Set the attributes of the two trackers individually, then add both to output", () => {
    asyncQueue.push(['setAttribute:firstTracker', 2])
    asyncQueue.push(['setAttribute:sp', 3])
    asyncQueue.push(['addAttributeToOutput:firstTracker;sp'])
    expect(output).toEqual(29)
  })

  it('Execute a user-defined custom callback', () => {
    let callbackExecuted = false
    asyncQueue.push([
      function() {
        callbackExecuted = true
      },
    ])
    expect(callbackExecuted).toBe(true)
  })

  it('Executing a custom callback that errors should not throw', () => {
    expect(() => {
      asyncQueue.push([
        function() {
          throw 'caught error'
        },
      ])
    }).not.toThrow()
  })
})
