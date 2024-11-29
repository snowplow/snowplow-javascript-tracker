import { BrowserPluginConfiguration, BrowserTracker, ParsedIdCookie } from '@snowplow/browser-tracker-core';
import { TrackerCore } from '@snowplow/tracker-core';

/**
 * Creates a fake BrowserTracker from a TrackerCore instance in order to use in browser plugins.
 * Most of the methods are not implemented and will throw an error if called.
 * However, our plugins mostly only call the `core` methods.
 */
function toBrowserTracker(namespace: string, core: TrackerCore): BrowserTracker {
  const notImplemented = () => {
    throw new Error('Not implemented in React Native');
  };
  return {
    id: namespace,
    namespace,
    core,
    sharedState: {
      bufferFlushers: [],
      hasLoaded: true,
      registeredOnLoadHandlers: [],
    },
    getDomainSessionIndex: () => 0,
    getPageViewId: () => '',
    getTabId: () => null,
    getCookieName: () => '',
    getUserId: () => undefined,
    getDomainUserId: () => '',
    getDomainUserInfo: (): ParsedIdCookie => ['', '', 0, 0, 0, undefined, '', '', '', undefined, 0],
    setReferrerUrl: () => notImplemented,
    setCustomUrl: () => notImplemented,
    setDocumentTitle: () => notImplemented,
    discardHashTag: () => notImplemented,
    discardBrace: () => notImplemented,
    setCookiePath: () => notImplemented,
    setVisitorCookieTimeout: () => notImplemented,
    newSession: () => notImplemented,
    crossDomainLinker: () => notImplemented,
    enableActivityTracking: () => notImplemented,
    enableActivityTrackingCallback: () => notImplemented,
    disableActivityTracking: () => notImplemented,
    disableActivityTrackingCallback: () => notImplemented,
    updatePageActivity: () => notImplemented,
    setOptOutCookie: () => notImplemented,
    setUserId: () => notImplemented,
    setUserIdFromLocation: () => notImplemented,
    setUserIdFromReferrer: () => notImplemented,
    setUserIdFromCookie: () => notImplemented,
    setCollectorUrl: () => notImplemented,
    setBufferSize: () => notImplemented,
    flushBuffer: () => notImplemented,
    preservePageViewId: () => notImplemented,
    preservePageViewIdForUrl: () => notImplemented,
    trackPageView: () => notImplemented,
    disableAnonymousTracking: () => notImplemented,
    enableAnonymousTracking: () => notImplemented,
    clearUserData: () => notImplemented,
    addPlugin: () => notImplemented,
  };
}

export function newPlugins(namespace: string, core: TrackerCore) {
  return {
    addPlugin: (plugin: BrowserPluginConfiguration) => {
      core.addPlugin(plugin);
      if (plugin.plugin.activateBrowserPlugin) {
        const browserTracker = toBrowserTracker(namespace, core);
        plugin.plugin.activateBrowserPlugin?.(browserTracker);
      }
    },
  };
}
