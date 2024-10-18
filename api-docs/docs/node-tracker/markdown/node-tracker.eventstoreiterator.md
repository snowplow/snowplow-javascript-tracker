<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [EventStoreIterator](./node-tracker.eventstoreiterator.md)

## EventStoreIterator interface

<b>Signature:</b>

```typescript
interface EventStoreIterator 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [next](./node-tracker.eventstoreiterator.next.md) | () =&gt; Promise&lt;{ value: EventStorePayload \| undefined; done: boolean; }&gt; | Retrieve the next event in the store |
