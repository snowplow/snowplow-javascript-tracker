/*
 * JavaScript tracker for Snowplow: tests/integration/autoTracking.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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

import util from 'util'
import F from 'lodash/fp'
import { fetchResults, start, stop } from '../micro'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

const isMatchWithCallback = F.isMatchWith((lt, rt) =>
  F.isFunction(rt) ? rt(lt) : undefined
)

const SAFARI_EXPECTED_FIRST_NAME = 'Alex'
const SAFARI_EXPECTED_MESSAGE = 'Changed message'

describe('Auto tracking', () => {
  if (F.isMatch({ browserName: 'internet explorer', version: '9' }, browser.capabilities)) {
    fit('Skip IE9', () => {}) // Automated tests for IE autotracking features 
  }

  let log = []
  let docker

  const logContains = ev => F.some(isMatchWithCallback(ev), log)

  const loadUrlAndWait = (url) => {
    browser.url(url)
    browser.waitUntil(
      () => $('#init').getText() === 'true',
      {
        timeout: 5000,
        timeoutMsg: 'expected init after 5s',
        interval: 250
      }
    )
  }

  beforeAll(() => {
    browser.call(() => {
      return start()
        .then((container) => {
          docker = container
        })
    })
    browser.url('/index.html')
    browser.setCookies({ name: 'container', value: docker.url })
  })

  afterAll(() => {
    browser.call(() => {
      return stop(docker.container)
    })
  })

  it('should send a link click events', () => {
    loadUrlAndWait('/link-tracking.html')
    $('#link-to-click').click()
    
    loadUrlAndWait('/link-tracking.html?filter=exclude')
    $('#link-to-not-track').click()
    $('#link-to-click').click()

    loadUrlAndWait('/link-tracking.html?filter=filter')
    $('#link-to-filter').click()
    $('#link-to-click').click()

    loadUrlAndWait('/link-tracking.html?filter=include')
    $('#link-to-filter').click()
    $('#link-to-click').click()

    // time for activity to register and request to arrive
    browser.pause(5000)
    browser.call(() =>
      fetchResults(docker.url).then(result => {
        log = result
      })
    )
  })

  it('should send a link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/link-tracking.html',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementTarget: '_self'
              }
            } 
          },
          contexts: {
            data: [{
              schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
              data: { keywords: ['tester'] }
            }]
          }
        },
      })
    ).toBe(true)
  })

  it('should not send a blocked link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                elementId: 'link-to-not-track'
              }
            } 
          }
        },
      })
    ).toBe(false)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=exclude#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should not send a filtered link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                elementId: 'link-to-filter'
              }
            } 
          }
        },
      })
    ).toBe(false)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=filter#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should not send a non-included link click event', () => {
    expect(
      logContains({
        event: {
            event: 'unstruct',
            app_id: 'autotracking',
            unstruct_event: {
              data: {
                schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
                data: {
                  elementId: 'link-to-filter'
                }
              } 
            }
        },
      })
    ).toBe(false)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=include#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send form events', () => {
    loadUrlAndWait('/form-tracking.html')
    $('#fname').click()

    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      $('#fname').setValue(SAFARI_EXPECTED_FIRST_NAME)
    } else {
      $('#fname').clearValue()
    }

    $('#lname').click()

    browser.pause(250)

    $('#bike').click()

    browser.pause(250)

    $('#cars').click()
    $('#cars').selectByAttribute('value', 'saab')
    $('#cars').click()

    browser.pause(250)

    $('#message').click()

    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      $('#message').setValue(SAFARI_EXPECTED_MESSAGE)
    } else {
      $('#message').clearValue()
    }

    browser.pause(250)

    $('#terms').click()

    browser.pause(2000)

    $('#submit').click()

    browser.pause(1000)

    loadUrlAndWait('/form-tracking.html?filter=exclude')

    $('#fname').click()
    $('#lname').click()

    browser.pause(1000)

    loadUrlAndWait('/form-tracking.html?filter=include')

    $('#lname').click()

    browser.pause(1000)

    loadUrlAndWait('/form-tracking.html?filter=filter')

    $('#fname').click()
    $('#lname').click()

    browser.pause(1000)

    loadUrlAndWait('/form-tracking.html?filter=excludedForm')

    $('#excluded-fname').click()
    $('#excluded-submit').click()

    // time for activity to register and request to arrive
    browser.pause(2500)

    browser.call(() =>
      fetchResults(docker.url).then(result => {
        log = result
      })
    )
  })

  it('should send focus_form and change_form on text input', () => {
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedFirstName = ''
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedFirstName = SAFARI_EXPECTED_FIRST_NAME
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'fname',
                nodeName: 'INPUT',
                elementType: 'text',
                elementClasses: ['test'],
                value: 'John'
              }
            } 
          }
        },
      })
    ).toBe(true)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'fname',
                nodeName: 'INPUT',
                type: 'text',
                elementClasses: ['test'],
                value: expectedFirstName
              }
            } 
          }
        },
      })
    ).toBe(true)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'lname',
                nodeName: 'INPUT',
                elementType: 'text',
                elementClasses: [],
                value: 'Doe'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })
  
  it('should send change_form on radio input', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'vehicle',
                nodeName: 'INPUT',
                type: 'radio',
                elementClasses: [],
                value: 'Bike'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send focus_form and change_form on select change', () => {
    // MS Edge <= 18 doesn't fire change events on select elements via Edge WebDriver
    if (F.isMatch({ browserName: 'MicrosoftEdge', browserVersion: '25.10586.0.0' }, browser.capabilities)) {
      return;
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'cars',
                nodeName: 'SELECT',
                elementClasses: [],
                value: 'volvo'
              }
            } 
          }
        },
      })
    ).toBe(true)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'cars',
                nodeName: 'SELECT',
                elementClasses: [],
                value: 'saab'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send focus_form and change_form on textarea input', () => {
    
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedMessage = ''
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedMessage = SAFARI_EXPECTED_MESSAGE
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'message',
                nodeName: 'TEXTAREA',
                elementClasses: [],
                value: 'This is a message'
              }
            } 
          }
        },
      })
    ).toBe(true)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'message',
                nodeName: 'TEXTAREA',
                elementClasses: [],
                value: expectedMessage
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send change_form on checkbox', () => {

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'terms',
                nodeName: 'INPUT',
                type: 'checkbox',
                elementClasses: [],
                value: 'agree'
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send submit_form on form submission', () => {
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedFirstName = '', expectedMessage = ''
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedFirstName = SAFARI_EXPECTED_FIRST_NAME
      expectedMessage = SAFARI_EXPECTED_MESSAGE
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                formClasses: [ 'formy-mcformface' ],
                elements: [
                  {
                    name: 'message',
                    value: expectedMessage,
                    nodeName: 'TEXTAREA'
                  },
                  {
                    name: 'fname',
                    value: expectedFirstName,
                    nodeName: 'INPUT',
                    type: 'text'
                  },
                  {
                    name: 'lname',
                    value: 'Doe',
                    nodeName: 'INPUT',
                    type: 'text'
                  },
                  {
                    name: 'vehicle',
                    value: 'Bike',
                    nodeName: 'INPUT',
                    type: 'radio'
                  },
                  {
                    name: 'terms',
                    value: 'agree',
                    nodeName: 'INPUT',
                    type: 'checkbox'
                  },
                  { 
                    name: 'cars', 
                    value: 'saab', 
                    nodeName: 'SELECT' 
                  }
                ]
              }
            } 
          },
          contexts: {
            data: [{
              schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
              data: { keywords: ['tester'] }
            }]
          }
        },
      })
    ).toBe(true)
  })

  it('should not send focus_form on excluded element', () => { 
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=exclude',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'fname',
              }
            } 
          }
        },
      })
    ).toBe(false)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=exclude',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send focus_form on included element', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=include',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              }
            } 
          }
        },
      })
    ).toBe(true)
  })

  it('should send focus_form on element included by filter', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=filter',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'fname',
              }
            } 
          }
        },
      })
    ).toBe(true)

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=filter',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              }
            } 
          }
        },
      })
    ).toBe(false)
  })

  it('should not send focus_form on elements', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'excluded-fname',
              }
            } 
          }
        },
      })
    ).toBe(false)
  })

  it('should not send submit_form', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'excludedForm',
                formClasses: [ 'excluded-form' ]
              }
            } 
          }
        }
      })
    ).toBe(false)
  })
})
