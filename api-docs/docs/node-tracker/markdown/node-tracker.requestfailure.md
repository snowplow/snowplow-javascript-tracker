<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [RequestFailure](./node-tracker.requestfailure.md)

## RequestFailure type

The data that will be available to the `onRequestFailure` callback

<b>Signature:</b>

```typescript
type RequestFailure = {
    events: EventBatch;
    status?: number;
    message?: string;
    willRetry: boolean;
};
```