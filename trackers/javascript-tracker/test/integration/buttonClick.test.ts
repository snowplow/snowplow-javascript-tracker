import F from 'lodash/fp';
import { fetchResults } from '../micro';
import { pageSetup } from './helpers';

const loadUrlAndWait = async (url: string) => {
  await browser.url(url);
  await browser.waitUntil(async () => (await $('#init').getText()) === 'true', {
    timeout: 5000,
    timeoutMsg: 'expected init after 5s',
  });
};

describe('Snowplow Micro integration', () => {
  if (browser.capabilities.browserName === 'internet explorer') {
    fit('Skip IE', () => true);
    return;
  }

  let eventMethods = ['get', 'post', 'beacon'];
  let log: Array<any> = [];
  let testIdentifier = '';

  const logContains = (ev: unknown) => F.some(F.isMatch(ev as object), log);

  type Button = {
    label: string;
    id?: string;
    classes?: Array<string>;
    name?: string;
  };

  const makeEvent = (button: Button, method: string) => {
    return {
      event: {
        event: 'unstruct',
        app_id: 'button-click-tracking-' + testIdentifier,
        page_url: `http://snowplow-js-tracker.local:8080/button-click-tracking.html?eventMethod=${method}`,
        unstruct_event: {
          data: {
            schema: 'iglu:com.snowplowanalytics.snowplow/button_click/jsonschema/1-0-0',
            data: button,
          },
        },
      },
    };
  };

  const logContainsButtonClick = (event: any) => {
    expect(logContains(event)).toBe(true);
  };

  const nButtons = 7;
  beforeAll(async () => {
    testIdentifier = await pageSetup();

    const runClicks = async (method: string) => {
      await loadUrlAndWait('/button-click-tracking.html?eventMethod=' + method);
      for (let i = 1; i < nButtons; i++) {
        await (await $(`#button${i}`)).click();
        await browser.pause(50);
      }
      // Dynamic button
      await (await $('#addDynamic')).click();
      await browser.pause(500);
      await (await $('#button7')).click();
      await browser.pause(500);

      // Nested child
      await (await $('#button-child')).click();
      await browser.pause(500);

      // Disable/enable

      await (await $('#disable')).click();
      await browser.pause(500);
      await (await $('#disabled-click')).click();
      await browser.pause(500);

      await (await $('#enable')).click();
      await browser.pause(500);
      await (await $('#enabled-click')).click();
      await browser.pause(500);

      await (await $('#set-multiple-configs')).click();
      await browser.pause(500);

      await (await $('#final-config')).click();
      await browser.pause(500);
    };

    for (let method of eventMethods) {
      await runClicks(method);
      await browser.pause(6000);
    }

    log = await browser.call(async () => await fetchResults());
  });

  eventMethods.forEach((method) => {
    it('should get button1', () => {
      const ev = makeEvent({ id: 'button1', label: 'TestButton' }, method);
      logContainsButtonClick(ev);
    });

    it('should get button2', () => {
      const ev = makeEvent({ id: 'button2', label: 'TestButtonWithClass', classes: ['test-class'] }, method);
      logContainsButtonClick(ev);
    });

    it('should get button3', () => {
      const ev = makeEvent(
        { id: 'button3', label: 'TestButtonWithClasses', classes: ['test-class', 'test-class2'] },
        method
      );
      logContainsButtonClick(ev);
    });

    it('should get button4', () => {
      const ev = makeEvent({ id: 'button4', label: 'TestWithName', name: 'testName' }, method);
      logContainsButtonClick(ev);
    });

    it('should get button5', () => {
      const ev = makeEvent({ id: 'button5', label: 'DataLabel' }, method);
      logContainsButtonClick(ev);
    });

    it('should get button6', () => {
      const ev = makeEvent({ id: 'button6', label: 'TestInputButton' }, method);
      logContainsButtonClick(ev);
    });

    it('should get button7 after it is added dynamically', async () => {
      const ev = makeEvent({ id: 'button7', label: 'TestDynamicButton-' + method }, method);
      logContainsButtonClick(ev);
    });

    it('should get button when click was on a child element', async () => {
      const ev = makeEvent({ label: 'TestChildren' }, method);
      logContainsButtonClick(ev);
    });

    it('should not get disabled-click', () => {
      const ev = makeEvent({ id: 'disabled-click', label: 'DisabledClick' }, method);
      expect(logContains(ev)).toBe(false);
    });

    it('should get enabled-click', () => {
      const ev = makeEvent({ id: 'enabled-click', label: 'EnabledClick' }, method);
      logContainsButtonClick(ev);
    });

    it('should get `final-config` as it is the last config set', () => {
      const ev = makeEvent({ id: 'final-config', classes: ['final-config'], label: 'Final Config' }, method);
      logContainsButtonClick(ev);
    });
  });
});
