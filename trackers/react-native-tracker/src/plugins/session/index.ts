import { CorePluginConfiguration, PayloadBuilder } from '@snowplow/tracker-core';
import { v4 as uuidv4 } from 'uuid';
import { BACKGROUND_EVENT_SCHEMA, CLIENT_SESSION_ENTITY_SCHEMA, FOREGROUND_EVENT_SCHEMA } from '../../constants';
import { AsyncStorage, SessionConfiguration, SessionState, TrackerConfiguration } from '../../types';
import { getUsefulSchema } from '../../utils';

interface StoredSessionState {
  userId: string;
  sessionId: string;
  sessionIndex: number;
}

interface SessionPlugin extends CorePluginConfiguration {
  getSessionUserId: () => Promise<string | undefined>;
  getSessionId: () => Promise<string | undefined>;
  getSessionIndex: () => Promise<number | undefined>;
  getSessionState: () => Promise<SessionState>;
  startNewSession: () => Promise<void>;
}

async function storeSessionState(namespace: string, state: StoredSessionState, asyncStorage: AsyncStorage) {
  const { userId, sessionId, sessionIndex } = state;
  await asyncStorage.setItem(`snowplow_${namespace}_session`, JSON.stringify({ userId, sessionId, sessionIndex }));
}

async function resumeStoredSession(namespace: string, asyncStorage: AsyncStorage): Promise<SessionState> {
  const storedState = await asyncStorage.getItem(`snowplow_${namespace}_session`);
  if (storedState) {
    const state = JSON.parse(storedState) as StoredSessionState;
    return {
      userId: state.userId,
      sessionId: uuidv4(),
      previousSessionId: state.sessionId,
      sessionIndex: state.sessionIndex + 1,
      storageMechanism: 'LOCAL_STORAGE',
    };
  } else {
    return {
      userId: uuidv4(),
      sessionId: uuidv4(),
      sessionIndex: 1,
      storageMechanism: 'LOCAL_STORAGE',
    };
  }
}

/**
 * Creates a new session plugin for tracking the session information.
 * The plugin will add the session context to all events and start a new session if the current one has timed out.
 *
 * The session state is stored in the defined application storage.
 * Each restart of the app or creation of a new tracker instance will trigger a new session with reference to the previous session.
 */
export async function newSessionPlugin({
  asyncStorage,
  namespace,
  sessionContext = true,
  foregroundSessionTimeout,
  backgroundSessionTimeout,
}: TrackerConfiguration & SessionConfiguration & { asyncStorage: AsyncStorage }): Promise<SessionPlugin> {
  let sessionState = await resumeStoredSession(namespace, asyncStorage);
  await storeSessionState(namespace, sessionState, asyncStorage);

  let inBackground = false;
  let lastUpdateTs = new Date().getTime();

  const startNewSession = async () => {
    sessionState = {
      userId: sessionState.userId,
      storageMechanism: sessionState.storageMechanism,
      sessionId: uuidv4(),
      sessionIndex: sessionState.sessionIndex + 1,
      previousSessionId: sessionState.sessionId,
    };
  };

  const getTimeoutMs = () => {
    return ((inBackground ? backgroundSessionTimeout : foregroundSessionTimeout) ?? 30 * 60) * 1000;
  };

  const beforeTrack = (payloadBuilder: PayloadBuilder) => {
    // check if session has timed out and start a new one if necessary
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdateTs;
    if (timeDiff > getTimeoutMs()) {
      startNewSession();
      storeSessionState(namespace, sessionState, asyncStorage);
    }
    lastUpdateTs = now.getTime();

    // update event properties
    sessionState.eventIndex = (sessionState.eventIndex ?? 0) + 1;
    if (sessionState.eventIndex === 1) {
      sessionState.firstEventId = payloadBuilder.getPayload().eid as string;
      sessionState.firstEventTimestamp = now.toISOString();
    }

    // update background state
    if (payloadBuilder.getPayload().e === 'ue') {
      const schema = getUsefulSchema(payloadBuilder);
      if (schema === FOREGROUND_EVENT_SCHEMA) {
        inBackground = false;
      } else if (schema === BACKGROUND_EVENT_SCHEMA) {
        inBackground = true;
      }
    }

    // add session context to the payload
    if (sessionContext) {
      payloadBuilder.addContextEntity({
        schema: CLIENT_SESSION_ENTITY_SCHEMA,
        data: { ...sessionState },
      });
    }
  };

  return {
    getSessionUserId: () => Promise.resolve(sessionState.userId),
    getSessionId: () => Promise.resolve(sessionState.sessionId),
    getSessionIndex: () => Promise.resolve(sessionState.sessionIndex),
    getSessionState: () => Promise.resolve(sessionState),
    startNewSession,
    plugin: {
      beforeTrack,
    },
  };
}
