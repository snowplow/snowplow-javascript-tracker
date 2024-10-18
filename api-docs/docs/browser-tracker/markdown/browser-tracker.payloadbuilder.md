<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/browser-tracker](./browser-tracker.md) &gt; [PayloadBuilder](./browser-tracker.payloadbuilder.md)

## PayloadBuilder interface

Interface for mutable object encapsulating tracker payload

<b>Signature:</b>

```typescript
interface PayloadBuilder 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [add](./browser-tracker.payloadbuilder.add.md) | (key: string, value: unknown) =&gt; void | Adds an entry to the Payload |
|  [addContextEntity](./browser-tracker.payloadbuilder.addcontextentity.md) | (entity: SelfDescribingJson) =&gt; void | Caches a context entity to be added to payload on build |
|  [addDict](./browser-tracker.payloadbuilder.adddict.md) | (dict: Payload) =&gt; void | Merges a payload into the existing payload |
|  [addJson](./browser-tracker.payloadbuilder.addjson.md) | (keyIfEncoded: string, keyIfNotEncoded: string, json: Record&lt;string, unknown&gt;) =&gt; void | Caches a JSON object to be added to payload on build |
|  [build](./browser-tracker.payloadbuilder.build.md) | () =&gt; Payload | Builds and returns the Payload |
|  [getJson](./browser-tracker.payloadbuilder.getjson.md) | () =&gt; EventJson | Gets all JSON objects added to payload |
|  [getPayload](./browser-tracker.payloadbuilder.getpayload.md) | () =&gt; Payload | Gets the current payload, before cached JSON is processed |
|  [withJsonProcessor](./browser-tracker.payloadbuilder.withjsonprocessor.md) | (jsonProcessor: JsonProcessor) =&gt; void | Adds a function which will be executed when building the payload to process the JSON which has been added to this payload |
