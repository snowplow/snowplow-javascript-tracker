import { filterFunctionFromFilter, createEventFromButton } from '../src/util';

describe('Button Click Tracking Plugin', () => {
  describe('filterToFunction', () => {
    const createDiv = (className: string): HTMLDivElement => {
      const ret = document.createElement('div');
      ret.className = className;
      return ret;
    };

    it('should return a function that returns true if no filter is provided', () => {
      const filter = filterFunctionFromFilter(undefined);
      expect(filter(createDiv(''))).toBe(true);
    });

    it('should turn an allowlist into a filter function', () => {
      const filter = filterFunctionFromFilter({ allowlist: ['foo'] });
      expect(filter(createDiv('foo'))).toBe(true);
      expect(filter(createDiv('bar'))).toBe(false);
    });

    it('should turn a denylist into a filter function', () => {
      const filter = filterFunctionFromFilter({ denylist: ['foo'] });
      expect(filter(createDiv('foo'))).toBe(false);
      expect(filter(createDiv('bar'))).toBe(true);
    });
  });

  describe('getFilterPassingButtons', () => {
    type TestDocument = {
      testDocument: Document;
      include_btn: HTMLButtonElement | HTMLInputElement;
      exclude_btn: HTMLButtonElement | HTMLInputElement;
    };

    describe('HTMLButtonElements', () => {
      const getTestDocument = (): TestDocument => {
        const testDocument = document.implementation.createHTMLDocument('test');
        const include_btn = testDocument.createElement('button');
        include_btn.className = 'include';
        testDocument.body.appendChild(include_btn);
        const exclude_btn = testDocument.createElement('button');
        exclude_btn.className = 'exclude';
        testDocument.body.appendChild(exclude_btn);

        return {
          testDocument,
          include_btn,
          exclude_btn,
        };
      };

      const { testDocument, include_btn, exclude_btn } = getTestDocument();
      const buttons = Array.from(testDocument.getElementsByTagName('button'));

      it('should return all elements if no filter is provided', () => {
        const buttonFilter = filterFunctionFromFilter(undefined);
        const filteredButtons = buttons.filter(buttonFilter);
        expect(filteredButtons).toEqual([include_btn, exclude_btn]);
      });

      it('should only return elements that match the `filter` function', () => {
        const filter = filterFunctionFromFilter((element?: HTMLElement) => element?.className === 'include');
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });

      it('should return all elements with the classes in `allowlist`', () => {
        const filter = filterFunctionFromFilter({ allowlist: ['include'] });
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });

      it('should not return any elements with the classes in `denylist`', () => {
        const filter = filterFunctionFromFilter({ denylist: ['exclude'] });
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });
    });

    describe('HTMLInputElement', () => {
      const getTestDocument = (): TestDocument => {
        const testDocument = document.implementation.createHTMLDocument('test');
        const include_btn = testDocument.createElement('input');
        include_btn.type = 'button';
        include_btn.className = 'include';
        testDocument.body.appendChild(include_btn);
        const exclude_btn = testDocument.createElement('input');
        exclude_btn.type = 'button';
        exclude_btn.className = 'exclude';
        testDocument.body.appendChild(exclude_btn);

        return {
          testDocument,
          include_btn,
          exclude_btn,
        };
      };

      const { testDocument, include_btn, exclude_btn } = getTestDocument();
      const buttons = Array.from(testDocument.getElementsByTagName('input')).filter((input) => input.type === 'button');

      it('should return all elements if no filter is provided', () => {
        const buttonFilter = filterFunctionFromFilter(undefined);
        const filteredButtons = buttons.filter(buttonFilter);
        expect(filteredButtons).toEqual([include_btn, exclude_btn]);
      });

      it('should only return elements that match the `filter` function', () => {
        const filter = filterFunctionFromFilter((element?: HTMLElement) => element?.className === 'include');
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });

      it('should return all elements with the classes in `allowlist`', () => {
        const filter = filterFunctionFromFilter({ allowlist: ['include'] });
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });

      it('should not return any elements with the classes in `denylist`', () => {
        const filter = filterFunctionFromFilter({ denylist: ['exclude'] });
        const filteredButtons = buttons.filter(filter);
        expect(filteredButtons).toEqual([include_btn]);
      });
    });
  });

  describe('createEventFromButton', () => {
    describe('HTMLButtonElement', () => {
      it('should create an event from a button', () => {
        const button = document.createElement('button');
        button.innerText = 'testLabel';
        button.id = 'testId';
        button.className = 'testClass testClass2';
        button.name = 'testName';

        const event = {
          label: 'testLabel',
          id: 'testId',
          classes: ['testClass', 'testClass2'],
          name: 'testName',
        };

        expect(createEventFromButton(button)).toEqual(event);
      });

      it('should use specified default label', () => {
        const button = document.createElement('button');
        button.innerText = '';
        button.id = 'testId';
        button.className = 'testClass testClass2';
        button.name = 'testName';

        const event1 = {
          label: 'defaultLabel',
          id: 'testId',
          classes: ['testClass', 'testClass2'],
          name: 'testName',
        };

        expect(createEventFromButton(button, 'defaultLabel')).toEqual(event1);

        const event2 = {
          label: 'testClass testClass2',
          id: 'testId',
          classes: ['testClass', 'testClass2'],
          name: 'testName',
        };
        expect(createEventFromButton(button, (btn) => btn.className)).toEqual(event2);
      });

      it('should prefer the data-sp-button-label attribute over the innerText', () => {
        const button = document.createElement('button');
        button.innerText = 'testLabel';

        button.setAttribute('data-sp-button-label', 'testLabelFromAttribute');
        expect(createEventFromButton(button).label).toEqual('testLabelFromAttribute');
      });
    });
    describe('HTMLInputElement', () => {
      it('should create an event from an input', () => {
        const input = document.createElement('input');
        input.type = 'button';
        input.value = 'testLabel';
        input.id = 'testId';
        input.className = 'testClass testClass2';
        input.name = 'testName';

        const event = {
          label: 'testLabel',
          id: 'testId',
          classes: ['testClass', 'testClass2'],
          name: 'testName',
        };

        expect(createEventFromButton(input)).toEqual(event);
      });

      it('should prefer the data-sp-button-label attribute over the value', () => {
        const input = document.createElement('input');
        input.type = 'button';
        input.value = 'testLabel';

        input.setAttribute('data-sp-button-label', 'testLabelFromAttribute');
        expect(createEventFromButton(input).label).toEqual('testLabelFromAttribute');
      });
    });
  });
});
