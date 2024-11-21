<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [EmitterConfigurationBase](./react-native-tracker.emitterconfigurationbase.md) &gt; [retryFailedRequests](./react-native-tracker.emitterconfigurationbase.retryfailedrequests.md)

## EmitterConfigurationBase.retryFailedRequests property

Whether to retry failed requests to the collector.

Failed requests are requests that failed due to \[timeouts\](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout\_event), \[network errors\](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/error\_event), and \[abort events\](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort\_event).

Takes precedent over `retryStatusCodes` and `dontRetryStatusCodes`<!-- -->.

<b>Signature:</b>

```typescript
retryFailedRequests?: boolean;
```