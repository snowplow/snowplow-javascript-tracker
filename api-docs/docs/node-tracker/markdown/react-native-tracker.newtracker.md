<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [newTracker](./react-native-tracker.newtracker.md)

## newTracker() function

Creates a new tracker instance with the given configuration

<b>Signature:</b>

```typescript
export declare function newTracker(configuration: TrackerConfiguration & EmitterConfiguration & SessionConfiguration & SubjectConfiguration & EventStoreConfiguration & ScreenTrackingConfiguration & PlatformContextConfiguration & DeepLinkConfiguration & AppLifecycleConfiguration): Promise<ReactNativeTracker>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  configuration | [TrackerConfiguration](./react-native-tracker.trackerconfiguration.md) &amp; EmitterConfiguration &amp; [SessionConfiguration](./react-native-tracker.sessionconfiguration.md) &amp; [SubjectConfiguration](./react-native-tracker.subjectconfiguration.md) &amp; [EventStoreConfiguration](./react-native-tracker.eventstoreconfiguration.md) &amp; ScreenTrackingConfiguration &amp; [PlatformContextConfiguration](./react-native-tracker.platformcontextconfiguration.md) &amp; [DeepLinkConfiguration](./react-native-tracker.deeplinkconfiguration.md) &amp; [AppLifecycleConfiguration](./react-native-tracker.applifecycleconfiguration.md) | Configuration for the tracker |

<b>Returns:</b>

Promise&lt;[ReactNativeTracker](./react-native-tracker.reactnativetracker.md)<!-- -->&gt;

Tracker instance

