<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [ListItemViewProps](./react-native-tracker.listitemviewprops.md)

## ListItemViewProps type

Event tracking the view of an item in a list. If screen engagement tracking is enabled, the list item view events will be aggregated into a `screen_summary` entity.

Schema: `iglu:com.snowplowanalytics.mobile/list_item_view/jsonschema/1-0-0`

<b>Signature:</b>

```typescript
export declare type ListItemViewProps = {
    index: number;
    itemsCount?: number;
};
```