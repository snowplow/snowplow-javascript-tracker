import {
  addEventListener,
  flushPendingCookies,
  getCssClasses,
  getFilterByClass,
  getFilterByName,
  type BrowserTracker,
  type FilterCriterion,
} from '@snowplow/browser-tracker-core';
import {
  buildFormFocusOrChange,
  buildFormSubmission,
  resolveDynamicContext,
  type DynamicContext,
} from '@snowplow/tracker-core';

/** The form tracking configuration */
export interface FormTrackingConfiguration {
  /** The options which can be configured for the form tracking events */
  options?: FormTrackingOptions;
  /** The dyanmic context which will be evaluated for each form event */
  context?: DynamicContext | null;
}

/** Events to capture in form tracking */
enum FormTrackingEvent {
  /** Form field changed event */
  CHANGE_FORM = 'change_form',
  /** Form field focused event */
  FOCUS_FORM = 'focus_form',
  /** Form submitted event */
  SUBMIT_FORM = 'submit_form',
}

const defaultFormTrackingEvents = [
  FormTrackingEvent.CHANGE_FORM,
  FormTrackingEvent.FOCUS_FORM,
  FormTrackingEvent.SUBMIT_FORM,
];

/** Form tracking plugin options to determine which events to fire and the elements to listen for */
interface FormTrackingOptions {
  /** Whether to handle events in the capture phase or the bubbling phase. Capture is usually more reliable, but may trigger early if you need changes from other submit handlers in your transforms, filters, or context generators. Defaults to true. */
  useCapture?: boolean;
  /** List of `form` elements that are allowed to generate events, or criteria for deciding that when the event listener handles the event */
  forms?:
    | FilterCriterion<HTMLElement>
    | HTMLCollectionOf<HTMLFormElement>
    | NodeListOf<HTMLFormElement>
    | HTMLFormElement[];
  /** Criteria for fields within forms that should generate focus or change events; you may also include a transformation function for fields that may include personal data */
  fields?: FilterCriterion<TrackedHTMLElement> & { transform?: transformFn };
  /** Allow list of events to enable tracking for; can be any combination of focus_form, change_form, or submit_form */
  events?: `${FormTrackingEvent}`[];
  /** A list of targets to add event listeners to. If not provided, defaults to the current `document` */
  targets?: EventTarget[];
}

type TrackedHTMLElementTagNameMap = Pick<HTMLElementTagNameMap, 'textarea' | 'input' | 'select'>;

type TrackedHTMLElement = TrackedHTMLElementTagNameMap[keyof TrackedHTMLElementTagNameMap];

interface ElementData extends Record<string, string | null | undefined> {
  name: string;
  value: string | null;
  nodeName: string;
  type?: string;
}

type transformFn = (
  elementValue: string | null,
  elementInfo: ElementData | TrackedHTMLElement,
  elt: TrackedHTMLElement
) => string | null;

type ElementDataWrapper = { elementData: ElementData; originalElement: TrackedHTMLElement };

const defaultTransformFn: transformFn = (x) => x;

interface FormConfiguration {
  formFilter: (_: HTMLFormElement) => boolean;
  fieldFilter: (_: TrackedHTMLElement) => boolean;
  fieldTransform: transformFn;
  forms: HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement> | HTMLFormElement[] | null;
}

const _focusListeners: Record<string, EventListener> = {};
const _changeListeners: Record<string, EventListener> = {};
const _submitListeners: Record<string, EventListener> = {};
const _targets: Record<string, EventTarget[]> = {};
const _captures: Record<string, boolean> = {};

/**
 * Add submission/focus/change event listeners to page for forms and elements according to `configuration`
 *
 * @param tracker The tracker instance the listener belongs to that will be used to track events
 * @param configuration Plugin configuration controlling the events to track and forms/fields to target or transform
 */
export function addFormListeners(tracker: BrowserTracker, configuration: FormTrackingConfiguration) {
  const { options, context } = configuration,
    config = getConfigurationForOptions(options);

  const events = options?.events ?? defaultFormTrackingEvents;

  const useCapture = (_captures[tracker.id] = options?.useCapture ?? true);

  const targets = (_targets[tracker.id] = getTargetList(options?.targets, config.forms));

  if (events.indexOf(FormTrackingEvent.FOCUS_FORM) !== -1) {
    _focusListeners[tracker.id] = getFormChangeListener(tracker, config, FormTrackingEvent.FOCUS_FORM, context);
    targets.forEach((target) => addEventListener(target, 'focus', _focusListeners[tracker.id], true)); // focus does not bubble
  }
  if (events.indexOf(FormTrackingEvent.CHANGE_FORM) !== -1) {
    _changeListeners[tracker.id] = getFormChangeListener(tracker, config, FormTrackingEvent.CHANGE_FORM, context);
    targets.forEach((target) => addEventListener(target, 'change', _changeListeners[tracker.id], useCapture));
  }
  if (events.indexOf(FormTrackingEvent.SUBMIT_FORM) !== -1) {
    _submitListeners[tracker.id] = getFormSubmissionListener(tracker, config, context);
    targets.forEach((target) => addEventListener(target, 'submit', _submitListeners[tracker.id], useCapture));
  }
}

/**
 * Builds a list of targets for the plugin event listeners
 *
 * The list can include any specifically provided targets, and will be extended to include the root nodes of any explicit HTMLFormElements provided
 * With neither provided, defaults to the current page's `document` element
 *
 * @param configTargets Explicitly configured list of event target listeners, if any
 * @param forms Explicitly configured list of form elements to track, if any
 * @returns List of EventTargets to add the listener to
 */
function getTargetList(configTargets: EventTarget[] | undefined, forms: FormConfiguration['forms']) {
  // we attach to document rather than window because the window focus event occurs more often than we require
  const targets = configTargets ?? [document];

  if (forms) {
    Array.prototype.forEach.call(forms, (form: HTMLFormElement) => {
      targets.push(form.ownerDocument.documentElement);
    });
  }

  return targets;
}

/**
 * Remove all submission/focus/change event listeners from page that have been added via a call to `addFormListeners`
 *
 * @param tracker The tracker instance the listener belongs to that will be used to track events
 */
export function removeFormListeners(tracker: BrowserTracker) {
  const targets = _targets[tracker.id] ?? [document];
  const useCapture = _captures[tracker.id] ?? true;
  targets.forEach((target) => {
    if (_focusListeners[tracker.id]) target.removeEventListener('focus', _focusListeners[tracker.id], true); // focus does not bubble
    if (_changeListeners[tracker.id]) target.removeEventListener('change', _changeListeners[tracker.id], useCapture);
    if (_submitListeners[tracker.id]) target.removeEventListener('submit', _submitListeners[tracker.id], useCapture);
  });
}

/**
 * Check if forms array is a collection of HTML form elements or a filter or undefined
 */
function isCollectionOfHTMLFormElements(
  forms?:
    | FilterCriterion<HTMLFormElement>
    | HTMLCollectionOf<HTMLFormElement>
    | NodeListOf<HTMLFormElement>
    | HTMLFormElement[]
): forms is HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement> | HTMLFormElement[] {
  return forms != null && Array.prototype.slice.call(forms).length > 0;
}

/**
 * Typeguard for `element` to see if it appears to be the HTMLElement with tagName `type`
 *
 * instanceof checks don't work for cross-document nodes, which this plugin supports
 *
 * @param elem Object to check element type
 * @param type Element type we're checking for
 * @returns If `element` is an element with tagName `type`
 */
function isElement<E extends Uppercase<keyof HTMLElementTagNameMap>>(
  elem: unknown,
  type: E
): elem is HTMLElementTagNameMap[Lowercase<E>] {
  if (typeof elem === 'object' && elem) {
    if ('tagName' in elem && typeof (elem as Element)['tagName'] === 'string') {
      return (elem as Element).tagName.toUpperCase() === type;
    }
  }

  return false;
}

/**
 * Determine if given object is a `TrackedHTMLElement` or not
 *
 * @param element Value to determine
 * @returns If `element` is `TrackedHTMLElement`
 */
function isTrackableElement(element: EventTarget | null): element is TrackedHTMLElement {
  return isElement(element, 'INPUT') || isElement(element, 'SELECT') || isElement(element, 'TEXTAREA');
}

/**
 * Configures form tracking: which forms and fields will be tracked, and the context to attach
 *
 * @param options User-supplied configuration
 * @returns Final configuration incorporating defaults
 */
function getConfigurationForOptions(options?: FormTrackingOptions): FormConfiguration {
  if (options) {
    let formFilter = (_: HTMLElement) => true;
    let forms: HTMLCollectionOf<HTMLFormElement> | NodeListOf<HTMLFormElement> | HTMLFormElement[] | null = null;
    if (isCollectionOfHTMLFormElements(options.forms)) {
      // options.forms is an explicity allowlist of HTML form elements
      forms = options.forms;
    } else {
      // options.forms is null or a filter
      formFilter = getFilterByClass(options.forms);
    }
    return {
      forms,
      formFilter,
      fieldFilter: getFilterByName<TrackedHTMLElement>(options.fields),
      fieldTransform: getTransform(options.fields),
    };
  } else {
    return {
      forms: null,
      formFilter: () => true,
      fieldFilter: () => true,
      fieldTransform: defaultTransformFn,
    };
  }
}

/**
 * Check if the found target element is included in the explicit form allowlist, if provided.
 *
 * @param target A `form` element to check if we're allowed to track.
 * @param allowed An optional list of form elements we want to track against.
 * @returns True if there is no allowlist or the `target` is in the allowlist, false otherwise.
 */
function explicitlyAllowedForm(target: HTMLFormElement, allowed: FormConfiguration['forms']) {
  if (!allowed) return true;

  for (let i = 0; i < allowed.length; i++) {
    if (allowed[i].isSameNode(target)) return true;
  }

  return false;
}

/**
 * Convert a criterion object to a transform function
 *
 * @param criterion
 * @returns Transformation function if provided in `criterion`, or a default identity function
 */
function getTransform(criterion?: { transform?: transformFn }): transformFn {
  if (criterion && typeof criterion.transform === 'function') {
    return criterion.transform;
  }

  return defaultTransformFn;
}

/**
 * Get an identifier for a form or `TrackedHTMLElement`
 *
 * @param elt Element to identify
 * @returns Identifier for `elt`
 */
function getElementIdentifier(elt: Record<string, any>) {
  const properties = ['name', 'id', 'type', 'nodeName'] as const;
  for (const propName of properties) {
    if (elt[propName] && typeof elt[propName] === 'string') {
      return elt[propName];
    }
  }

  return null;
}

/**
 * Discovers the parent form in which an element is contained
 *
 * @param elt Child control to identify the owning form for
 * @returns The form element this control belongs to or null if not found
 */
function getParentForm(elt: TrackedHTMLElement | null) {
  if (elt && elt.form) return elt.form;

  let parent: ParentNode | null = elt;

  while (parent) {
    if (isElement(parent, 'FORM')) {
      return parent;
    }
    parent = parent.parentNode;
  }

  return parent;
}

/**
 * Returns a list of the `TrackedHTMLElement`s inside a form along with their values
 *
 * @param elt Form element to get the control elements for
 * @returns Array of wrapped control elements belonging to the form
 */
function getInnerFormElements(elt: HTMLFormElement) {
  const innerElements: Array<ElementDataWrapper> = [];

  Array.prototype.forEach.call(elt.elements, function (child: Element) {
    if (!isTrackableElement(child)) return;

    const inputType = (child.type || 'text').toLowerCase();

    // submit and image are roughly equivalent
    if (inputType === 'submit' || inputType === 'image') {
      return;
    }

    const elementJson: ElementDataWrapper = {
      elementData: {
        name: getElementIdentifier(child)!,
        value: child.value,
        nodeName: child.nodeName,
      },
      originalElement: child,
    };

    if (isElement(child, 'INPUT')) {
      elementJson.elementData.type = inputType;

      if (inputType === 'password' || ((inputType === 'checkbox' || inputType === 'radio') && !child.checked)) {
        elementJson.elementData.value = null;
      }
    }

    innerElements.push(elementJson);
  });

  return innerElements;
}

/**
 * Create closure function to handle form field change/focus event
 *
 * @param tracker The tracker instance to generate the event with
 * @param config Plugin configuration
 * @param event_type Type of event to generate
 * @param context List of entities or context generators to evaluate with the event
 * @returns A form change/focus handler
 */
function getFormChangeListener(
  tracker: BrowserTracker,
  config: FormConfiguration,
  event_type: Exclude<FormTrackingEvent, FormTrackingEvent.SUBMIT_FORM>,
  context?: DynamicContext | null
) {
  return function (e: Event) {
    const target = e.composed ? e.composedPath()[0] : e.target;

    // `change` and `submit` are not composed and are thus invisible to us
    // bind late to the forms/field directly on field focus in this case
    if (target !== e.target && e.composed && isTrackableElement(target)) {
      if (target.form) {
        if (_changeListeners[tracker.id])
          addEventListener(target.form, 'change', _changeListeners[tracker.id], _captures[tracker.id]);
        if (_submitListeners[tracker.id])
          addEventListener(target.form, 'submit', _submitListeners[tracker.id], _captures[tracker.id]);
      } else {
        if (_changeListeners[tracker.id])
          addEventListener(target, 'change', _changeListeners[tracker.id], _captures[tracker.id]);
      }
    }

    if (isTrackableElement(target) && config.fieldFilter(target)) {
      let value: string | null = null;
      let type: string | null = null;

      if (isElement(target, 'INPUT')) {
        type = (target.type || 'text').toLowerCase();
        value =
          (type === 'checkbox' && !target.checked) || type === 'password'
            ? null
            : config.fieldTransform(target.value, target, target);
      } else {
        value = config.fieldTransform(target.value, target, target);
      }

      const form = getParentForm(target);
      if (!(form && config.formFilter(form) && explicitlyAllowedForm(form, config.forms))) return;

      if (event_type === 'change_form' || (type !== 'checkbox' && type !== 'radio')) {
        tracker.core.track(
          buildFormFocusOrChange({
            schema: event_type,
            formId: getElementIdentifier(form ?? {}) ?? '',
            elementId: getElementIdentifier(target) ?? '',
            nodeName: target.nodeName,
            type,
            elementClasses: getCssClasses(target),
            value: value ?? null,
          }),
          resolveDynamicContext(context, target, type, value)
        );
      }
    }
  };
}

/**
 * Create closure function to handle form submission event
 *
 * @param tracker The tracker instance to generate the event with
 * @param config Plugin configuration
 * @param context List of entities or context generators to evaluate with the event
 * @returns A form submit handler
 */
function getFormSubmissionListener(
  tracker: BrowserTracker,
  config: FormConfiguration,
  context?: DynamicContext | null
) {
  return function ({ target }: Event) {
    if (isElement(target, 'FORM') && config.formFilter(target) && explicitlyAllowedForm(target, config.forms)) {
      const elementsData: ElementData[] = [];

      getInnerFormElements(target).forEach(function ({ elementData, originalElement }) {
        if (config.fieldFilter(originalElement) && originalElement.type.toLowerCase() !== 'password') {
          elementData.value = config.fieldTransform(elementData.value, elementData, originalElement);
          elementsData.push(elementData);
        }
      });

      tracker.core.track(
        buildFormSubmission({
          formId: getElementIdentifier(target) ?? '',
          formClasses: getCssClasses(target),
          elements: elementsData,
        }),
        resolveDynamicContext(context, target, elementsData)
      );
      flushPendingCookies();
    }
  };
}
