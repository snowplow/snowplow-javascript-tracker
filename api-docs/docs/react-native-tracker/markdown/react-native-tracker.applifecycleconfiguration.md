<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [AppLifecycleConfiguration](./react-native-tracker.applifecycleconfiguration.md)

## AppLifecycleConfiguration interface

Configuration for app lifecycle tracking

<b>Signature:</b>

```typescript
export interface AppLifecycleConfiguration 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [appBuild?](./react-native-tracker.applifecycleconfiguration.appbuild.md) | string | <i>(Optional)</i> Build name of the application e.g s9f2k2d or 1.1.0 beta<!-- -->Entity schema: <code>iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0</code> |
|  [appVersion?](./react-native-tracker.applifecycleconfiguration.appversion.md) | string | <i>(Optional)</i> Version number of the application e.g 1.1.0 (semver or git commit hash).<!-- -->Entity schema if <code>appBuild</code> property is set: <code>iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0</code> Entity schema if <code>appBuild</code> property is not set: <code>iglu:com.snowplowanalytics.snowplow/application/jsonschema/1-0-0</code> |
|  [installAutotracking?](./react-native-tracker.applifecycleconfiguration.installautotracking.md) | boolean | <i>(Optional)</i> Whether to automatically track app install event on first run.<!-- -->Schema: <code>iglu:com.snowplowanalytics.mobile/application_install/jsonschema/1-0-0</code> |
|  [lifecycleAutotracking?](./react-native-tracker.applifecycleconfiguration.lifecycleautotracking.md) | boolean | <i>(Optional)</i> Whether to automatically track app lifecycle events (app foreground and background events). Also adds a lifecycle context entity to all events.<!-- -->Foreground event schema: <code>iglu:com.snowplowanalytics.snowplow/application_foreground/jsonschema/1-0-0</code> Background event schema: <code>iglu:com.snowplowanalytics.snowplow/application_background/jsonschema/1-0-0</code> Context entity schema: <code>iglu:com.snowplowanalytics.mobile/application_lifecycle/jsonschema/1-0-0</code> |
