import forEach from 'lodash/forEach';
import find from 'lodash/find';
import filter from 'lodash/filter';
import isObject from 'lodash/isObject';
import {
  getCssClasses,
  resolveDynamicContexts,
  getFilterByClass,
  getFilterByName,
  addEventListener,
  ApiPlugin,
  ApiMethods,
  DynamicContexts,
  SharedState,
  FilterCriterion,
} from '@snowplow/browser-core';
import { Core, Plugin } from '@snowplow/tracker-core';

interface FormTrackingConfig {
  forms: FilterCriterion<HTMLElement>;
  fields: FilterCriterion<TrackedHTMLElement> & { transform: transformFn };
}

interface FormMethods extends ApiMethods {
  enableFormTracking: (config: FormTrackingConfig, context: DynamicContexts) => void;
}

interface TrackedHTMLElementTagNameMap {
  textarea: HTMLTextAreaElement;
  input: HTMLInputElement;
  select: HTMLSelectElement;
}

type TrackedHTMLElement = TrackedHTMLElementTagNameMap[keyof TrackedHTMLElementTagNameMap];

interface ElementData extends Record<string, string | null | undefined> {
  name: string | null;
  value: string | null;
  nodeName: string;
  type?: string;
}

type transformFn = (x: string | null, _?: ElementData | TrackedHTMLElement) => string | null;

const FormTrackingPlugin = (): Plugin & ApiPlugin<FormMethods> => {
  let _core: Core,
    _state: SharedState,
    _trackingMarker: string,
    innerElementTags: Array<keyof TrackedHTMLElementTagNameMap> = ['textarea', 'input', 'select'];

  // Filter to determine which forms should be tracked
  var formFilter = function (_: HTMLFormElement) {
    return true;
  };

  // Filter to determine which form fields should be tracked
  var fieldFilter = function (_: TrackedHTMLElement) {
    return true;
  };

  // Default function applied to all elements, optionally overridden by transform field
  var fieldTransform: transformFn = function (x: string | null, _?: ElementData | TrackedHTMLElement) {
    return x;
  };

  /**
   * Convert a criterion object to a transform function
   *
   * @param object criterion {transform: function (elt) {return the result of transform function applied to element}
   */
  function getTransform(criterion: { transform: transformFn }): transformFn {
    const defaultFn: transformFn = (x: string | null, _?: ElementData | TrackedHTMLElement) => {
      return x;
    };

    if (!isObject(criterion)) {
      return defaultFn;
    }

    if (criterion.hasOwnProperty('transform')) {
      return criterion.transform;
    }

    return defaultFn;
  }

  /*
   * Get an identifier for a form, input, textarea, or select element
   */
  function getElementIdentifier(elt: Record<string, any>) {
    const properties: Array<'name' | 'id' | 'type' | 'nodeName'> = ['name', 'id', 'type', 'nodeName'];
    const found = find(properties, (propName) => {
      // If elt has a child whose name is "id", that element will be returned
      // instead of the actual id of elt unless we ensure that a string is returned
      return elt[propName] != false && typeof elt[propName] === 'string';
    });

    if (found) return elt[found];

    return null;
  }

  /*
   * Identifies the parent form in which an element is contained
   */
  function getParentFormIdentifier(elt: Node | null) {
    while (elt && elt.nodeName && elt.nodeName.toUpperCase() !== 'HTML' && elt.nodeName.toUpperCase() !== 'FORM') {
      elt = elt.parentNode;
    }
    if (elt && elt.nodeName && elt.nodeName.toUpperCase() === 'FORM') {
      return getElementIdentifier(elt);
    }

    return null;
  }

  /*
   * Returns a list of the input, textarea, and select elements inside a form along with their values
   */
  function getInnerFormElements(elt: HTMLFormElement) {
    var innerElements: Array<ElementData> = [];
    forEach(innerElementTags, (tagname: 'textarea' | 'input' | 'select') => {
      var trackedChildren = filter(elt.getElementsByTagName(tagname), function (child) {
        return child.hasOwnProperty(_trackingMarker);
      });

      forEach(trackedChildren, function (child) {
        if (child.type === 'submit') {
          return;
        }
        var elementJson: ElementData = {
          name: getElementIdentifier(child),
          value: child.value,
          nodeName: child.nodeName,
        };
        if (child.type && child.nodeName.toUpperCase() === 'INPUT') {
          elementJson.type = child.type;
        }

        if ((child.type === 'checkbox' || child.type === 'radio') && !(child as HTMLInputElement).checked) {
          elementJson.value = null;
        }
        innerElements.push(elementJson);
      });
    });

    return innerElements;
  }

  /*
   * Return function to handle form field change event
   */
  function getFormChangeListener(event_type: string, context: DynamicContexts) {
    return function (e: Event) {
      var elt = e.target as TrackedHTMLElement;
      if (elt) {
        var type = elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT' ? elt.type : null;
        var value =
          elt.type === 'checkbox' && !(elt as HTMLInputElement).checked ? null : fieldTransform(elt.value, elt);
        if (event_type === 'change_form' || (type !== 'checkbox' && type !== 'radio')) {
          _core.trackFormFocusOrChange(
            event_type,
            getParentFormIdentifier(elt) ?? '',
            getElementIdentifier(elt) ?? '',
            elt.nodeName,
            type,
            getCssClasses(elt),
            value ?? null,
            resolveDynamicContexts(context, elt, type, value)
          );
        }
      }
    };
  }

  /*
   * Return function to handle form submission event
   */
  function getFormSubmissionListener(context: DynamicContexts) {
    return function (e: Event) {
      var elt = e.target as HTMLFormElement;
      var innerElements = getInnerFormElements(elt);
      forEach(innerElements, function (innerElement) {
        innerElement.value = fieldTransform(innerElement.value, innerElement);
      });
      _core.trackFormSubmission(
        getElementIdentifier(elt) ?? '',
        getCssClasses(elt),
        innerElements,
        resolveDynamicContexts(context, elt, innerElements)
      );
    };
  }

  /*
   * Configures form tracking: which forms and fields will be tracked, and the context to attach
   */
  function configureFormTracking(config: FormTrackingConfig) {
    if (config) {
      formFilter = getFilterByClass(config.forms);
      fieldFilter = getFilterByName<TrackedHTMLElement>(config.fields);
      fieldTransform = getTransform(config.fields);
    }
  }

  /*
   * Add submission event listeners to all form elements
   * Add value change event listeners to all mutable inner form elements
   */
  function addFormListeners(context: DynamicContexts) {
    forEach(document.getElementsByTagName('form'), function (form) {
      if (formFilter(form) && !form[_trackingMarker]) {
        forEach(innerElementTags, function (tagname) {
          forEach(form.getElementsByTagName(tagname), function (innerElement) {
            if (
              fieldFilter(innerElement) &&
              !(innerElement as any)[_trackingMarker] &&
              innerElement.type.toLowerCase() !== 'password'
            ) {
              addEventListener(innerElement, 'focus', getFormChangeListener('focus_form', context), false);
              addEventListener(innerElement, 'change', getFormChangeListener('change_form', context), false);
              (innerElement as any)[_trackingMarker] = true;
            }
          });
        });

        addEventListener(form, 'submit', getFormSubmissionListener(context));
        form[_trackingMarker] = true;
      }
    });
  }

  return {
    coreInit: (core: Core) => {
      _core = core;
    },
    trackerInit: (trackerId: string, state: SharedState) => {
      _state = state;
      _trackingMarker = trackerId + 'form';
    },
    apiMethods: {
      /**
       * Enables automatic form tracking.
       * An event will be fired when a form field is changed or a form submitted.
       * This can be called multiple times: only forms not already tracked will be tracked.
       *
       * @param object config Configuration object determining which forms and fields to track.
       *                      Has two properties: "forms" and "fields"
       * @param array context Context for all form tracking events
       */
      enableFormTracking: function (config: FormTrackingConfig, context: DynamicContexts) {
        if (_state.hasLoaded) {
          configureFormTracking(config);
          addFormListeners(context);
        } else {
          _state.registeredOnLoadHandlers.push(function () {
            configureFormTracking(config);
            addFormListeners(context);
          });
        }
      },
    },
  };
};

export { FormTrackingPlugin };
