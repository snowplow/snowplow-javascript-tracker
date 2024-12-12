import {
  buildSelfDescribingEvent,
  CorePluginConfiguration,
  SelfDescribingJson,
  TrackerCore,
} from '@snowplow/tracker-core';
import { AppLifecycleConfiguration, EventContext } from '../../types';
import { BACKGROUND_EVENT_SCHEMA, FOREGROUND_EVENT_SCHEMA, LIFECYCLE_CONTEXT_SCHEMA } from '../../constants';
import { AppState } from 'react-native';

export interface AppLifecyclePlugin extends CorePluginConfiguration {
  getIsInBackground: () => boolean | undefined;
  getBackgroundIndex: () => number | undefined;
  getForegroundIndex: () => number | undefined;
}

/**
 * Tracks foreground and background events automatically when the app state changes.
 * Also adds a lifecycle context to all events with information about the app visibility.
 */
export async function newAppLifecyclePlugin(
  { lifecycleAutotracking = true }: AppLifecycleConfiguration,
  core: TrackerCore
): Promise<AppLifecyclePlugin> {
  let isInForeground = AppState.currentState !== 'background';
  let foregroundIndex = isInForeground ? 1 : 0;
  let backgroundIndex = isInForeground ? 0 : 1;
  let subscription: ReturnType<typeof AppState.addEventListener> | undefined;

  if (lifecycleAutotracking) {
    // Subscribe to app state changes and track foreground/background events
    subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && !isInForeground) {
        trackForegroundEvent();
      }
      if (nextAppState === 'background' && isInForeground) {
        trackBackgroundEvent();
      }
    });
  }

  const contexts = () => {
    let entities: SelfDescribingJson[] = [];

    if (lifecycleAutotracking) {
      // Add lifecycle context to all events
      entities.push({
        schema: LIFECYCLE_CONTEXT_SCHEMA,
        data: {
          isVisible: isInForeground,
          index: isInForeground ? foregroundIndex : backgroundIndex,
        },
      });
    }

    return entities;
  };

  const deactivatePlugin = () => {
    if (subscription) {
      subscription.remove();
      subscription = undefined;
    }
  };

  const trackForegroundEvent = (contexts?: EventContext[]) => {
    if (!isInForeground) {
      isInForeground = true;
      foregroundIndex += 1;
    }
    core.track(
      buildSelfDescribingEvent({ event: { schema: FOREGROUND_EVENT_SCHEMA, data: { foregroundIndex } } }),
      contexts
    );
  };

  const trackBackgroundEvent = (contexts?: EventContext[]) => {
    if (isInForeground) {
      isInForeground = false;
      backgroundIndex += 1;
    }
    core.track(
      buildSelfDescribingEvent({ event: { schema: BACKGROUND_EVENT_SCHEMA, data: { backgroundIndex } } }),
      contexts
    );
  };

  return {
    getIsInBackground: () => (lifecycleAutotracking ? !isInForeground : undefined),
    getBackgroundIndex: () => (lifecycleAutotracking ? backgroundIndex : undefined),
    getForegroundIndex: () => (lifecycleAutotracking ? foregroundIndex : undefined),
    plugin: {
      contexts,
      deactivatePlugin,
    },
  };
}
