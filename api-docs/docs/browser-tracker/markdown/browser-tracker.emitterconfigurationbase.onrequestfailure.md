<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/browser-tracker](./browser-tracker.md) &gt; [EmitterConfigurationBase](./browser-tracker.emitterconfigurationbase.md) &gt; [onRequestFailure](./browser-tracker.emitterconfigurationbase.onrequestfailure.md)

## EmitterConfigurationBase.onRequestFailure property

A callback function to be executed whenever a request fails to be sent to the collector. This is the inverse of the onRequestSuccess callback, so any non 2xx status code will trigger this callback.

<b>Signature:</b>

```typescript
onRequestFailure?: (data: RequestFailure) => void;
```