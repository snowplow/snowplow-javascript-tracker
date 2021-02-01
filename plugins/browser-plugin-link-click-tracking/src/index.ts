import isUndefined from 'lodash/isUndefined';
import {
  getHostName,
  getCssClasses,
  resolveDynamicContexts,
  addEventListener,
  getFilterByClass,
  FilterCriterion,
  DynamicContexts,
  ApiPlugin,
  SharedState,
  ApiMethods,
} from '@snowplow/browser-core';
import { Core, SelfDescribingJson, Timestamp, Plugin } from '@snowplow/tracker-core';

export interface LinkClickMethods extends ApiMethods {
  enableLinkClickTracking: (
    criterion: FilterCriterion<HTMLElement>,
    pseudoClicks: boolean,
    trackContent: boolean,
    context: DynamicContexts
  ) => void;
  refreshLinkClickTracking: () => void;
  trackLinkClick: (
    targetUrl: string,
    elementId?: string,
    elementClasses?: Array<string>,
    elementTarget?: string,
    elementContent?: string,
    context?: SelfDescribingJson[],
    tstamp?: Timestamp
  ) => void;
}

export const LinkClickTrackingPlugin = (): Plugin & ApiPlugin<LinkClickMethods> => {
  let _core: Core,
    _trackerId: string,
    _state: SharedState,
    // Filter function used to determine whether clicks on a link should be tracked
    linkTrackingFilter: (element: HTMLElement) => boolean,
    // Whether pseudo clicks are tracked
    linkTrackingPseudoClicks: boolean,
    // Whether to track the  innerHTML of clicked links
    linkTrackingContent: boolean,
    // The context attached to link click events
    linkTrackingContext: DynamicContexts,
    // Internal state of the pseudo click handler
    lastButton: number | null,
    lastTarget: EventTarget | null;

  /*
   * Process clicks
   */
  function processClick(sourceElement: Element, context: DynamicContexts) {
    let parentElement, tag, elementId, elementClasses, elementTarget, elementContent;

    while (
      (parentElement = sourceElement.parentElement) !== null &&
      !isUndefined(parentElement) && // buggy IE5.5
      (tag = sourceElement.tagName.toUpperCase()) !== 'A' &&
      tag !== 'AREA'
    ) {
      sourceElement = parentElement;
    }

    const anchorElement = <HTMLAnchorElement>sourceElement;
    if (!isUndefined(anchorElement.href)) {
      // browsers, such as Safari, don't downcase hostname and href
      var originalSourceHostName = anchorElement.hostname || getHostName(anchorElement.href),
        sourceHostName = originalSourceHostName.toLowerCase(),
        sourceHref = anchorElement.href.replace(originalSourceHostName, sourceHostName),
        scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i');

      // Ignore script pseudo-protocol links
      if (!scriptProtocol.test(sourceHref)) {
        elementId = anchorElement.id;
        elementClasses = getCssClasses(anchorElement);
        elementTarget = anchorElement.target;
        elementContent = linkTrackingContent ? anchorElement.innerHTML : undefined;

        // decodeUrl %xx
        sourceHref = unescape(sourceHref);
        _core.trackLinkClick(
          sourceHref,
          elementId,
          elementClasses,
          elementTarget,
          elementContent,
          resolveDynamicContexts(context, sourceElement)
        );
      }
    }
  }

  /*
   * Return function to handle click event
   */
  function getClickHandler(context: DynamicContexts): EventListenerOrEventListenerObject {
    return function (evt: Event) {
      var button, target;

      evt = evt || window.event;
      button = (evt as MouseEvent).which || (evt as MouseEvent).button;
      target = evt.target || evt.srcElement;

      // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.
      if (evt.type === 'click') {
        if (target) {
          processClick(target as Element, context);
        }
      } else if (evt.type === 'mousedown') {
        if ((button === 1 || button === 2) && target) {
          lastButton = button;
          lastTarget = target;
        } else {
          lastButton = lastTarget = null;
        }
      } else if (evt.type === 'mouseup') {
        if (button === lastButton && target === lastTarget) {
          processClick(target as Element, context);
        }
        lastButton = lastTarget = null;
      }
    };
  }

  /*
   * Add click listener to a DOM element
   */
  function addClickListener(element: HTMLAnchorElement | HTMLAreaElement) {
    if (linkTrackingPseudoClicks) {
      // for simplicity and performance, we ignore drag events
      addEventListener(element, 'mouseup', getClickHandler(linkTrackingContext), false);
      addEventListener(element, 'mousedown', getClickHandler(linkTrackingContext), false);
    } else {
      addEventListener(element, 'click', getClickHandler(linkTrackingContext), false);
    }
  }

  /*
   * Configures link click tracking: how to filter which links will be tracked,
   * whether to use pseudo click tracking, and what context to attach to link_click events
   */
  function configureLinkClickTracking(
    criterion: FilterCriterion<HTMLElement>,
    pseudoClicks: boolean,
    trackContent: boolean,
    context: DynamicContexts
  ) {
    linkTrackingContent = trackContent;
    linkTrackingContext = context;
    linkTrackingPseudoClicks = pseudoClicks;
    linkTrackingFilter = getFilterByClass(criterion);
  }

  /*
   * Add click handlers to anchor and AREA elements, except those to be ignored
   */
  function addClickListeners() {
    var linkElements = document.links,
      i;

    for (i = 0; i < linkElements.length; i++) {
      // Add a listener to link elements which pass the filter and aren't already tracked
      if (linkTrackingFilter(linkElements[i]) && !(linkElements[i] as any)[_trackerId]) {
        addClickListener(linkElements[i]);
        (linkElements[i] as any)[_trackerId] = true;
      }
    }
  }

  return {
    coreInit: (core: Core) => {
      _core = core;
    },
    trackerInit: (trackerId: string, state: SharedState) => {
      _trackerId = trackerId;
      _state = state;
    },
    apiMethods: {
      /**
       * Install link tracker
       *
       * The default behaviour is to use actual click events. However, some browsers
       * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
       *
       * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
       * This is not industry standard and is vulnerable to false positives (e.g., drag events).
       *
       * There is a Safari/Chrome/Webkit bug that prevents tracking requests from being sent
       * by either click handler.  The workaround is to set a target attribute (which can't
       * be "_self", "_top", or "_parent").
       *
       * @see https://bugs.webkit.org/show_bug.cgi?id=54783
       *
       * @param object criterion Criterion by which it will be decided whether a link will be tracked
       * @param bool pseudoClicks If true, use pseudo click-handler (mousedown+mouseup)
       * @param bool trackContent Whether to track the innerHTML of the link element
       * @param array context Context for all link click events
       */
      enableLinkClickTracking: function (
        criterion: FilterCriterion<HTMLElement>,
        pseudoClicks: boolean,
        trackContent: boolean,
        context: DynamicContexts
      ) {
        if (_state.hasLoaded) {
          // the load event has already fired, add the click listeners now
          configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
          addClickListeners();
        } else {
          // defer until page has loaded
          _state.registeredOnLoadHandlers.push(function () {
            configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
            addClickListeners();
          });
        }
      },

      /**
       * Add click event listeners to links which have been added to the page since the
       * last time enableLinkClickTracking or refreshLinkClickTracking was used
       */
      refreshLinkClickTracking: function () {
        if (_state.hasLoaded) {
          addClickListeners();
        } else {
          _state.registeredOnLoadHandlers.push(function () {
            addClickListeners();
          });
        }
      },

      /**
       * Manually log a click from your own code
       *
       * @param string targetUrl
       * @param string elementId
       * @param array elementClasses
       * @param string elementTarget
       * @param string elementContent innerHTML of the element
       * @param object Custom context relating to the event
       * @param tstamp number or Timestamp object
       */
      trackLinkClick: function (
        targetUrl: string,
        elementId?: string,
        elementClasses?: Array<string>,
        elementTarget?: string,
        elementContent?: string,
        context?: SelfDescribingJson[],
        tstamp?: Timestamp
      ) {
        _core.trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp);
      },
    },
  };
};
