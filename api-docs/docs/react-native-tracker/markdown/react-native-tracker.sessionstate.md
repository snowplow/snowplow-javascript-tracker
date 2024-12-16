<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [SessionState](./react-native-tracker.sessionstate.md)

## SessionState interface

Current session state that is tracked in events.

<b>Signature:</b>

```typescript
export interface SessionState 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [eventIndex?](./react-native-tracker.sessionstate.eventindex.md) | number | <i>(Optional)</i> Optional index of the current event in the session |
|  [firstEventId?](./react-native-tracker.sessionstate.firsteventid.md) | string | <i>(Optional)</i> The optional identifier of the first event for this session |
|  [firstEventTimestamp?](./react-native-tracker.sessionstate.firsteventtimestamp.md) | string | <i>(Optional)</i> Optional date-time timestamp of when the first event in the session was tracked |
|  [previousSessionId?](./react-native-tracker.sessionstate.previoussessionid.md) | string | <i>(Optional)</i> The previous session identifier for this user |
|  [sessionId](./react-native-tracker.sessionstate.sessionid.md) | string | An identifier for the session |
|  [sessionIndex](./react-native-tracker.sessionstate.sessionindex.md) | number | The index of the current session for this user |
|  [storageMechanism](./react-native-tracker.sessionstate.storagemechanism.md) | string | The mechanism that the session information has been stored on the device |
|  [userId](./react-native-tracker.sessionstate.userid.md) | string | An identifier for the user of the session |
