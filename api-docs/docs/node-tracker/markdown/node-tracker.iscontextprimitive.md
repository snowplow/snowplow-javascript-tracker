<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [isContextPrimitive](./node-tracker.iscontextprimitive.md)

## isContextPrimitive() function

Validates if the function can be a valid context primitive function or self describing json

<b>Signature:</b>

```typescript
declare function isContextPrimitive(input: unknown): input is ContextPrimitive;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  input | unknown | The function or orbject to be validated |

<b>Returns:</b>

input is ContextPrimitive

True if either a Context Generator or Self Describing JSON
