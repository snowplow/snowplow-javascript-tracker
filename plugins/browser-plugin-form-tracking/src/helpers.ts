/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
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

import {
  getCssClasses,
  addEventListener,
  BrowserTracker,
  FilterCriterion,
  getFilterByClass,
  getFilterByName,
} from '@snowplow/browser-tracker-core';
import { resolveDynamicContexts, DynamicContexts } from '@snowplow/tracker-core';

export interface FormTrackingConfig {
  forms: FilterCriterion<HTMLElement>;
  fields: FilterCriterion<TrackedHTMLElement> & { transform: transformFn };
}

export interface TrackerAndFormConfiguration {
  tracker: BrowserTracker;
  config?: {
    formFilter: (_: HTMLFormElement) => boolean;
    fieldFilter: (_: TrackedHTMLElement) => boolean;
    fieldTransform: transformFn;
  };
}

export interface TrackedHTMLElementTagNameMap {
  textarea: HTMLTextAreaElement;
  input: HTMLInputElement;
  select: HTMLSelectElement;
}

export type TrackedHTMLElement = TrackedHTMLElementTagNameMap[keyof TrackedHTMLElementTagNameMap];

export interface ElementData extends Record<string, string | null | undefined> {
  name: string | null;
  value: string | null;
  nodeName: string;
  type?: string;
}

export type transformFn = (x: string | null, elt: ElementData | TrackedHTMLElement) => string | null;

export const innerElementTags: Array<keyof TrackedHTMLElementTagNameMap> = ['textarea', 'input', 'select'];

const defaultTransformFn: transformFn = (x) => x;

/*
 * Configures form tracking: which forms and fields will be tracked, and the context to attach
 */
export function configureFormTracking(trackerConfig: TrackerAndFormConfiguration, config: FormTrackingConfig) {
  if (config) {
    trackerConfig.config = {
      formFilter: getFilterByClass(config.forms),
      fieldFilter: getFilterByName<TrackedHTMLElement>(config.fields),
      fieldTransform: getTransform(config.fields),
    };
  } else {
    trackerConfig.config = {
      formFilter: () => true,
      fieldFilter: () => true,
      fieldTransform: defaultTransformFn,
    };
  }
}

/**
 * Convert a criterion object to a transform function
 *
 * @param object criterion {transform: function (elt) {return the result of transform function applied to element}
 */
export function getTransform(criterion: { transform: transformFn }): transformFn {
  if (Object.prototype.hasOwnProperty.call(criterion, 'transform')) {
    return criterion.transform;
  }

  return defaultTransformFn;
}

/*
 * Add submission event listeners to all form elements
 * Add value change event listeners to all mutable inner form elements
 */
export function addFormListeners(trackerConfiguration: TrackerAndFormConfiguration, context: DynamicContexts) {
  const trackingMarker = trackerConfiguration.tracker.id + 'form';
  Array.prototype.slice.call(document.getElementsByTagName('form')).forEach(function (form) {
    if (trackerConfiguration.config?.formFilter(form) && !form[trackingMarker]) {
      Array.prototype.slice.call(innerElementTags).forEach(function (tagname) {
        Array.prototype.slice.call(form.getElementsByTagName(tagname)).forEach(function (innerElement) {
          if (
            trackerConfiguration.config?.fieldFilter(innerElement) &&
            !(innerElement as any)[trackingMarker] &&
            innerElement.type.toLowerCase() !== 'password'
          ) {
            addEventListener(
              innerElement,
              'focus',
              getFormChangeListener(trackerConfiguration, 'focus_form', context),
              false
            );
            addEventListener(
              innerElement,
              'change',
              getFormChangeListener(trackerConfiguration, 'change_form', context),
              false
            );
            (innerElement as any)[trackingMarker] = true;
          }
        });
      });

      addEventListener(form, 'submit', getFormSubmissionListener(trackerConfiguration, trackingMarker, context));
      form[trackingMarker] = true;
    }
  });
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
  var innerElements: Array<ElementData> = [];
  Array.prototype.slice.call(innerElementTags).forEach((tagname: 'textarea' | 'input' | 'select') => {
    let trackedChildren = Array.prototype.slice.call(elt.getElementsByTagName(tagname)).filter(function (child) {
      return child.hasOwnProperty(trackingMarker);
    });

    Array.prototype.slice.call(trackedChildren).forEach(function (child) {
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
function getFormChangeListener(
  trackerConfiguration: TrackerAndFormConfiguration,
  event_type: string,
  context: DynamicContexts
) {
  return function (e: Event) {
    var elt = e.target as TrackedHTMLElement;
    if (elt) {
      var type = elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT' ? elt.type : null;
      var value =
        elt.type === 'checkbox' && !(elt as HTMLInputElement).checked
          ? null
          : trackerConfiguration.config?.fieldTransform(elt.value, elt);
      if (event_type === 'change_form' || (type !== 'checkbox' && type !== 'radio')) {
        trackerConfiguration.tracker.core.trackFormFocusOrChange(
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
function getFormSubmissionListener(
  trackerConfiguration: TrackerAndFormConfiguration,
  trackingMarker: string,
  context: DynamicContexts
) {
  return function (e: Event) {
    var elt = e.target as HTMLFormElement;
    var innerElements = getInnerFormElements(trackingMarker, elt);
    innerElements.forEach(function (innerElement) {
      innerElement.value =
        trackerConfiguration.config?.fieldTransform(innerElement.value, innerElement) ?? innerElement.value;
    });
    trackerConfiguration.tracker.core.trackFormSubmission(
      getElementIdentifier(elt) ?? '',
      getCssClasses(elt),
      innerElements,
      resolveDynamicContexts(context, elt, innerElements)
    );
  };
}
