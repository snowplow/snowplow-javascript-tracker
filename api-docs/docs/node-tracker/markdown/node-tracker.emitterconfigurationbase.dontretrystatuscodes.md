<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [EmitterConfigurationBase](./node-tracker.emitterconfigurationbase.md) &gt; [dontRetryStatusCodes](./node-tracker.emitterconfigurationbase.dontretrystatuscodes.md)

## EmitterConfigurationBase.dontRetryStatusCodes property

List of HTTP response status codes for which events sent to Collector should not be retried in future request. Only non-success status codes are considered (greater or equal to 300). The don't retry codes are only considered for GET and POST requests. By default, the tracker retries on all non-success status codes except for 400, 401, 403, 410, and 422.

<b>Signature:</b>

```typescript
dontRetryStatusCodes?: number[];
```