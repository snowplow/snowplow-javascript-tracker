<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [SubjectConfiguration](./react-native-tracker.subjectconfiguration.md)

## SubjectConfiguration interface

Configuration of subject properties tracked with events

<b>Signature:</b>

```typescript
export interface SubjectConfiguration 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [colorDepth?](./react-native-tracker.subjectconfiguration.colordepth.md) | number | <i>(Optional)</i> Color depth (integer) |
|  [domainUserId?](./react-native-tracker.subjectconfiguration.domainuserid.md) | string | <i>(Optional)</i> The domain user id (DUID) is a generated identifier that is stored in a first party cookie on Web. The React Native tracker does not assign it automatically. |
|  [ipAddress?](./react-native-tracker.subjectconfiguration.ipaddress.md) | string | <i>(Optional)</i> Override the IP address of the device |
|  [language?](./react-native-tracker.subjectconfiguration.language.md) | string | <i>(Optional)</i> The language set in the device |
|  [networkUserId?](./react-native-tracker.subjectconfiguration.networkuserid.md) | string | <i>(Optional)</i> Override the network user id (UUIDv4) that is assigned by the collector and stored in cookies |
|  [screenResolution?](./react-native-tracker.subjectconfiguration.screenresolution.md) | [ScreenSize](./react-native-tracker.screensize.md) | <i>(Optional)</i> The screen resolution |
|  [screenViewport?](./react-native-tracker.subjectconfiguration.screenviewport.md) | [ScreenSize](./react-native-tracker.screensize.md) | <i>(Optional)</i> The screen viewport size |
|  [timezone?](./react-native-tracker.subjectconfiguration.timezone.md) | string | <i>(Optional)</i> The timezone label |
|  [useragent?](./react-native-tracker.subjectconfiguration.useragent.md) | string | <i>(Optional)</i> The custom user-agent. It overrides the user-agent used by default. |
|  [userId?](./react-native-tracker.subjectconfiguration.userid.md) | string | <i>(Optional)</i> Business-defined user ID for this user |

