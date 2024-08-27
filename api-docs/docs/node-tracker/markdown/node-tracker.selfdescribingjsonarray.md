<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [SelfDescribingJsonArray](./node-tracker.selfdescribingjsonarray.md)

## SelfDescribingJsonArray type

Export interface for any Self-Describing JSON which has the data attribute as an array

<b>Signature:</b>

```typescript
type SelfDescribingJsonArray<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
    schema: string;
    data: Array<T>;
};
```