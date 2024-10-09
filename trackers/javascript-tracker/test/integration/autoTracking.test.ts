import F from 'lodash/fp';
import { fetchResults } from '../micro';
import { pageSetup } from './helpers';
import { Key } from 'webdriverio';

const isMatchWithCallback = F.isMatchWith((lt, rt) => (F.isFunction(rt) ? rt(lt) : undefined));

const SAFARI_EXPECTED_FIRST_NAME = 'Alex';
const SAFARI_EXPECTED_MESSAGE = 'Changed message';

declare var addField: () => void;

describe('Auto tracking', () => {
  if (F.isMatch({ browserName: 'internet explorer', version: '9' }, browser.capabilities)) {
    fit('Skip IE9', () => {}); // Automated tests for IE autotracking features
  }

  let log: Array<unknown> = [];
  let testIdentifier = '';

  const logContains = (ev: unknown) => F.some(isMatchWithCallback(ev as object), log);

  const loadUrlAndWait = async (url: string) => {
    await browser.url(url);
    await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
      timeout: 5000,
      timeoutMsg: 'expected init after 5s',
      interval: 250,
    });
  };

  beforeAll(async () => {
    testIdentifier = await pageSetup();
  });

  it('should send a link click events', async () => {
    await loadUrlAndWait('/link-tracking.html');
    await $('#link-to-click').click();

    await loadUrlAndWait('/link-tracking.html?filter=exclude');
    await $('#link-to-not-track').click();
    await $('#link-to-click').click();

    await loadUrlAndWait('/link-tracking.html?filter=filter');
    await $('#link-to-filter').click();
    await $('#link-to-click').click();

    await loadUrlAndWait('/link-tracking.html?filter=include');
    await $('#link-to-filter').click();
    await $('#link-to-click').click();

    // time for activity to register and request to arrive
    await browser.pause(5000);
    log = await browser.call(async () => await fetchResults());
  });

  it('should send a link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/link-tracking.html',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementTarget: '_self',
              },
            },
          },
          contexts: {
            data: [
              {
                schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                data: { keywords: ['tester'] },
              },
            ],
          },
        },
      })
    ).toBe(true);
  });

  it('should not send a blocked link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                elementId: 'link-to-not-track',
              },
            },
          },
        },
      })
    ).toBe(false);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=exclude#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should not send a filtered link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                elementId: 'link-to-filter',
              },
            },
          },
        },
      })
    ).toBe(false);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=filter#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should not send a non-included link click event', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                elementId: 'link-to-filter',
              },
            },
          },
        },
      })
    ).toBe(false);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-link-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: {
                targetUrl: 'http://snowplow-js-tracker.local:8080/link-tracking.html?filter=include#click',
                elementId: 'link-to-click',
                elementClasses: ['example'],
                elementContent: 'Click here',
                elementTarget: '_self',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send form events', async () => {
    async function formInteraction() {
      await $('#fname').click();

      // Safari 12.1 doesn't fire onchange events when clearing
      // However some browsers don't support setValue
      if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
        await $('#fname').setValue(SAFARI_EXPECTED_FIRST_NAME);
      } else {
        await $('#fname').clearValue();
      }

      await $('#lname').click();

      await browser.pause(250);

      await $('#bike').click();

      await browser.pause(250);

      await $('#cars').click();
      await $('#cars').selectByAttribute('value', 'saab');
      await $('#cars').click();

      await browser.pause(250);

      await $('#message').click();

      // Safari 12.1 doesn't fire onchange events when clearing
      // However some browsers don't support setValue
      if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
        await $('#message').setValue(SAFARI_EXPECTED_MESSAGE);
      } else {
        await $('#message').clearValue();
      }
    }

    await loadUrlAndWait('/form-tracking.html');
    await formInteraction();

    await browser.pause(250);

    await $('#terms').click();

    await browser.pause(2000);

    await $('#submit').click();

    await browser.pause(1000);

    await browser.execute(() => {
      addField();
    });

    await $('#newfield').click();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=exclude');

    await $('#fname').click();
    await $('#lname').click();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=include');

    await $('#lname').click();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=filter');

    await $('#fname').click();
    await $('#lname').click();

    await loadUrlAndWait('/form-tracking.html?filter=transform');

    await $('#pid').click();
    await $('#submit').click();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=excludedForm');

    await $('#excluded-fname').click();
    await $('#excluded-submit').click();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=onlyFocus');
    await formInteraction();

    await browser.pause(1000);

    await loadUrlAndWait('/form-tracking.html?filter=iframeForm');
    let frame = await $('#form_iframe');
    await browser.switchToFrame(frame);
    await $('#fname').click();

    await loadUrlAndWait('/form-tracking.html?filter=shadow');
    const input = await (await $('shadow-form')).shadow$('input');
    await input.click();
    await input.setValue('test');
    await browser.keys(Key.Enter); // submit

    // time for activity to register and request to arrive
    await browser.pause(2500);

    log = await browser.call(async () => await fetchResults());
  });

  it('should send focus_form for the dynamically added form element', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'newfield',
                nodeName: 'INPUT',
                elementType: 'text',
                elementClasses: [],
                value: 'new',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send focus_form and change_form on text input', () => {
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedFirstName = '';
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedFirstName = SAFARI_EXPECTED_FIRST_NAME;
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'fname',
                nodeName: 'INPUT',
                elementType: 'text',
                elementClasses: ['test'],
                value: 'John',
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'fname',
                nodeName: 'INPUT',
                type: 'text',
                elementClasses: ['test'],
                value: expectedFirstName,
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'lname',
                nodeName: 'INPUT',
                elementType: 'text',
                elementClasses: [],
                value: 'Doe',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send change_form on radio input', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'vehicle',
                nodeName: 'INPUT',
                type: 'radio',
                elementClasses: [],
                value: 'Bike',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send focus_form and change_form on select change', () => {
    // MS Edge <= 18 doesn't fire change events on select elements via Edge WebDriver
    if (F.isMatch({ browserName: 'MicrosoftEdge', browserVersion: '25.10586.0.0' }, browser.capabilities)) {
      return;
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'cars',
                nodeName: 'SELECT',
                elementClasses: [],
                value: 'volvo',
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'cars',
                nodeName: 'SELECT',
                elementClasses: [],
                value: 'saab',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send focus_form and change_form on textarea input', () => {
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedMessage = '';
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedMessage = SAFARI_EXPECTED_MESSAGE;
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'message',
                nodeName: 'TEXTAREA',
                elementClasses: [],
                value: 'This is a message',
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'message',
                nodeName: 'TEXTAREA',
                elementClasses: [],
                value: expectedMessage,
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send change_form on checkbox', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'terms',
                nodeName: 'INPUT',
                type: 'checkbox',
                elementClasses: [],
                value: 'agree',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send submit_form on form submission', () => {
    // Safari 12.1 doesn't fire onchange events when clearing
    // However some browsers don't support setValue
    let expectedFirstName = '',
      expectedMessage = '';
    if (F.isMatch({ browserName: 'Safari', browserVersion: '12.1.1' }, browser.capabilities)) {
      expectedFirstName = SAFARI_EXPECTED_FIRST_NAME;
      expectedMessage = SAFARI_EXPECTED_MESSAGE;
    }

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                formClasses: ['formy-mcformface'],
                elements: [
                  {
                    name: 'message',
                    value: expectedMessage,
                    nodeName: 'TEXTAREA',
                  },
                  {
                    name: 'fname',
                    value: expectedFirstName,
                    nodeName: 'INPUT',
                    type: 'text',
                  },
                  {
                    name: 'lname',
                    value: 'Doe',
                    nodeName: 'INPUT',
                    type: 'text',
                  },
                  {
                    name: 'vehicle',
                    value: 'Bike',
                    nodeName: 'INPUT',
                    type: 'radio',
                  },
                  {
                    name: 'terms',
                    value: 'agree',
                    nodeName: 'INPUT',
                    type: 'checkbox',
                  },
                  {
                    name: 'cars',
                    value: 'saab',
                    nodeName: 'SELECT',
                  },
                ],
              },
            },
          },
          contexts: {
            data: [
              {
                schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
                data: { keywords: ['tester'] },
              },
            ],
          },
        },
      })
    ).toBe(true);
  });

  it('should not send focus_form on excluded element', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=exclude',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'fname',
              },
            },
          },
        },
      })
    ).toBe(false);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=exclude',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send focus_form on included element', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=include',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should send focus_form on element included by filter', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=filter',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'fname',
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=filter',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'lname',
              },
            },
          },
        },
      })
    ).toBe(false);
  });

  it('should not send focus_form on elements', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                elementId: 'excluded-fname',
              },
            },
          },
        },
      })
    ).toBe(false);
  });

  it('should not send submit_form', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'excludedForm',
                formClasses: ['excluded-form'],
              },
            },
          },
        },
      })
    ).toBe(false);
  });

  it('should only track focus_form and not change_form events when focus_form events are filtered', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=onlyFocus',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=onlyFocus',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
            },
          },
        },
      })
    ).toBe(false);
  });

  it('should track focus_form event from form in an iframe', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=iframeForm',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should track events from form in a shadowdom', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=shadow',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=shadow',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          page_url: 'http://snowplow-js-tracker.local:8080/form-tracking.html?filter=shadow',
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'shadow-form',
                formClasses: ['shadow-form'],
              },
            },
          },
        },
      })
    ).toBe(true);
  });

  it('should use transform function for pii field', () => {
    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                elementId: 'pname',
                nodeName: 'INPUT',
                elementClasses: [],
                value: 'redacted',
                elementType: 'text',
              },
            },
          },
        },
      })
    ).toBe(true);

    expect(
      logContains({
        event: {
          event: 'unstruct',
          app_id: 'autotracking-form-' + testIdentifier,
          unstruct_event: {
            data: {
              schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
              data: {
                formId: 'myForm',
                formClasses: ['formy-mcformface'],
                elements: [
                  {
                    name: 'message',
                    value: 'This is a message',
                    nodeName: 'TEXTAREA',
                  },
                  {
                    name: 'fname',
                    value: 'John',
                    nodeName: 'INPUT',
                    type: 'text',
                  },
                  { name: 'lname', value: 'Doe', nodeName: 'INPUT', type: 'text' },
                  {
                    name: 'pname',
                    value: 'redacted',
                    nodeName: 'INPUT',
                    type: 'text',
                  },
                  { name: 'vehicle', value: null, nodeName: 'INPUT', type: 'radio' },
                  { name: 'terms', value: null, nodeName: 'INPUT', type: 'checkbox' },
                  { name: 'cars', value: 'volvo', nodeName: 'SELECT' },
                ],
              },
            },
          },
        },
      })
    ).toBe(true);
  });
});
