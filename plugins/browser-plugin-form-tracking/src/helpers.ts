import {
  getCssClasses,
  addEventListener,
  BrowserTracker,
  FilterCriterion,
  getFilterByClass,
  getFilterByName,
} from '@snowplow/browser-tracker-core';
import {
  resolveDynamicContext,
  DynamicContext,
  buildFormFocusOrChange,
  buildFormSubmission,
} from '@snowplow/tracker-core';

/** The form tracking configuration */
export interface FormTrackingConfiguration {
  /** The options which can be configured for the form tracking events */
  options?: FormTrackingOptions;
  /** The dyanmic context which will be evaluated for each form event */
  context?: DynamicContext | null;
}

/** Events to capture in form tracking */
export enum FormTrackingEvent {
  /** Form field changed event */
  CHANGE_FORM = 'change_form',
  /** Form field focused event */
  FOCUS_FORM = 'focus_form',
  /** Form submitted event */
  SUBMIT_FORM = 'submit_form',
}

/** List of form tracking events to capture */
export type FormTrackingEvents = Array<FormTrackingEvent>;
const defaultFormTrackingEvents = [
  FormTrackingEvent.CHANGE_FORM,
  FormTrackingEvent.FOCUS_FORM,
  FormTrackingEvent.SUBMIT_FORM,
];

export interface FormTrackingOptions {
  forms?: FilterCriterion<HTMLElement> | HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement>;
  fields?: FilterCriterion<TrackedHTMLElement> & { transform: transformFn };
  events?: FormTrackingEvents;
}

export interface TrackedHTMLElementTagNameMap {
  textarea: HTMLTextAreaElement;
  input: HTMLInputElement;
  select: HTMLSelectElement;
}

export type TrackedHTMLElement = TrackedHTMLElementTagNameMap[keyof TrackedHTMLElementTagNameMap];

export interface ElementData extends Record<string, string | null | undefined> {
  name: string;
  value: string | null;
  nodeName: string;
  type?: string;
}

export type transformFn = (
  elementValue: string | null,
  elementInfo: ElementData | TrackedHTMLElement,
  elt: TrackedHTMLElement
) => string | null;

export const innerElementTags: Array<keyof TrackedHTMLElementTagNameMap> = ['textarea', 'input', 'select'];

type TrackedHTMLElementWithMarker = TrackedHTMLElement & Record<string, boolean>;

type ElementDataWrapper = { elementData: ElementData; originalElement: TrackedHTMLElement };

const defaultTransformFn: transformFn = (x) => x;

interface FormConfiguration {
  formFilter: (_: HTMLFormElement) => boolean;
  fieldFilter: (_: TrackedHTMLElement) => boolean;
  fieldTransform: transformFn;
}

/*
 * Add submission event listeners to all form elements
 * Add value change event listeners to all mutable inner form elements
 */
export function addFormListeners(tracker: BrowserTracker, configuration: FormTrackingConfiguration) {
  const { options, context } = configuration,
    trackingMarker = tracker.id + 'form',
    config = getConfigurationForOptions(options);

  let forms = config.forms ?? document.getElementsByTagName('form');
  Array.prototype.slice.call(forms).forEach(function (form: HTMLFormElement) {
    if (config.formFilter(form)) {
      Array.prototype.slice.call(innerElementTags).forEach(function (tagname: keyof TrackedHTMLElementTagNameMap) {
        Array.prototype.slice
          .call(form.getElementsByTagName(tagname))
          .forEach(function (innerElement: TrackedHTMLElementWithMarker) {
            if (
              config.fieldFilter(innerElement) &&
              !innerElement[trackingMarker] &&
              innerElement.type.toLowerCase() !== 'password'
            ) {
              if (config.eventFilter(FormTrackingEvent.FOCUS_FORM)) {
                addEventListener(
                  innerElement,
                  'focus',
                  getFormChangeListener(tracker, config, 'focus_form', context),
                  false
                );
              }
              if (config.eventFilter(FormTrackingEvent.CHANGE_FORM)) {
                addEventListener(
                  innerElement,
                  'change',
                  getFormChangeListener(tracker, config, 'change_form', context),
                  false
                );
              }
              innerElement[trackingMarker] = true;
            }
          });
      });

      if (!form[trackingMarker]) {
        if (config.eventFilter(FormTrackingEvent.SUBMIT_FORM)) {
          addEventListener(form, 'submit', getFormSubmissionListener(tracker, config, trackingMarker, context));
        }
        form[trackingMarker] = true;
      }
    }
  });
}

/**
 * Check if forms array is a collection of HTML form elements or a filter or undefined
 */
function isCollectionOfHTMLFormElements(
  forms?: FilterCriterion<HTMLFormElement> | HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement>
): forms is HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement> {
  return forms != null && Array.prototype.slice.call(forms).length > 0;
}

/*
 * Configures form tracking: which forms and fields will be tracked, and the context to attach
 */
function getConfigurationForOptions(options?: FormTrackingOptions) {
  if (options) {
    let formFilter = (_: HTMLElement) => true;
    let forms: HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement> | null = null;
    if (isCollectionOfHTMLFormElements(options.forms)) {
      // options.forms is a collection of HTML form elements
      forms = options.forms;
    } else {
      // options.forms is null or a filter
      formFilter = getFilterByClass(options.forms);
    }
    return {
      forms: forms,
      formFilter: formFilter,
      fieldFilter: getFilterByName<TrackedHTMLElement>(options.fields),
      fieldTransform: getTransform(options.fields),
      eventFilter: (event: FormTrackingEvent) => (options.events ?? defaultFormTrackingEvents).indexOf(event) > -1,
    };
  } else {
    return {
      forms: null,
      formFilter: () => true,
      fieldFilter: () => true,
      fieldTransform: defaultTransformFn,
      eventFilter: () => true,
    };
  }
}

/**
 * Convert a criterion object to a transform function
 *
 * @param object - criterion {transform: function (elt) {return the result of transform function applied to element}
 */
function getTransform(criterion?: { transform: transformFn }): transformFn {
  if (criterion && Object.prototype.hasOwnProperty.call(criterion, 'transform')) {
    return criterion.transform;
  }

  return defaultTransformFn;
}

/*
 * Get an identifier for a form, input, textarea, or select element
 */
function getElementIdentifier(elt: Record<string, any>) {
  const properties: Array<'name' | 'id' | 'type' | 'nodeName'> = ['name', 'id', 'type', 'nodeName'];
  for (const propName of properties) {
    if (elt[propName] != false && typeof elt[propName] === 'string') {
      return elt[propName];
    }
  }

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
function getInnerFormElements(trackingMarker: string, elt: HTMLFormElement) {
  var innerElements: Array<ElementDataWrapper> = [];
  Array.prototype.slice.call(innerElementTags).forEach((tagname: 'textarea' | 'input' | 'select') => {
    let trackedChildren = Array.prototype.slice.call(elt.getElementsByTagName(tagname)).filter(function (child) {
      return child.hasOwnProperty(trackingMarker);
    });

    Array.prototype.slice.call(trackedChildren).forEach(function (child) {
      if (child.type === 'submit') {
        return;
      }
      var elementJson: ElementDataWrapper = {
        elementData: {
          name: getElementIdentifier(child),
          value: child.value,
          nodeName: child.nodeName,
        },
        originalElement: child,
      };
      if (child.type && child.nodeName.toUpperCase() === 'INPUT') {
        elementJson.elementData.type = child.type;
      }

      if ((child.type === 'checkbox' || child.type === 'radio') && !(child as HTMLInputElement).checked) {
        elementJson.elementData.value = null;
      }
      innerElements.push(elementJson);
    });
  });

  return innerElements;
}

/*
 * Return function to handle form field change event
 */
function getFormChangeListener(
  tracker: BrowserTracker,
  config: FormConfiguration,
  event_type: 'change_form' | 'focus_form',
  context?: DynamicContext | null
) {
  return function (e: Event) {
    var elt = e.target as TrackedHTMLElement;
    if (elt) {
      var type = elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT' ? elt.type : null;
      var value =
        elt.type === 'checkbox' && !(elt as HTMLInputElement).checked
          ? null
          : config.fieldTransform(elt.value, elt, elt);
      if (event_type === 'change_form' || (type !== 'checkbox' && type !== 'radio')) {
        tracker.core.track(
          buildFormFocusOrChange({
            schema: event_type,
            formId: getParentFormIdentifier(elt) ?? '',
            elementId: getElementIdentifier(elt) ?? '',
            nodeName: elt.nodeName,
            type,
            elementClasses: getCssClasses(elt),
            value: value ?? null,
          }),
          resolveDynamicContext(context, elt, type, value)
        );
      }
    }
  };
}

/*
 * Return function to handle form submission event
 */
function getFormSubmissionListener(
  tracker: BrowserTracker,
  config: FormConfiguration,
  trackingMarker: string,
  context?: DynamicContext | null
) {
  return function (e: Event) {
    var elt = e.target as HTMLFormElement;
    var innerElements = getInnerFormElements(trackingMarker, elt);
    innerElements.forEach(function (innerElement) {
      var eltData = innerElement.elementData;
      eltData.value = config.fieldTransform(eltData.value, eltData, innerElement.originalElement) ?? eltData.value;
    });
    var elementsData = innerElements.map((elt) => elt.elementData);
    tracker.core.track(
      buildFormSubmission({
        formId: getElementIdentifier(elt) ?? '',
        formClasses: getCssClasses(elt),
        elements: elementsData,
      }),
      resolveDynamicContext(context, elt, elementsData)
    );
  };
}
