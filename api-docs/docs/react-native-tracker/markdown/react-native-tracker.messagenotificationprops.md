<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/react-native-tracker](./react-native-tracker.md) &gt; [MessageNotificationProps](./react-native-tracker.messagenotificationprops.md)

## MessageNotificationProps type

MessageNotification event properties schema: iglu:com.snowplowanalytics.mobile/message\_notification/jsonschema/1-0-0

<b>Signature:</b>

```typescript
export declare type MessageNotificationProps = {
    action?: string;
    attachments?: MessageNotificationAttachmentProps[];
    body: string;
    bodyLocArgs?: string[];
    bodyLocKey?: string;
    category?: string;
    contentAvailable?: boolean;
    group?: string;
    icon?: string;
    notificationCount?: number;
    notificationTimestamp?: string;
    sound?: string;
    subtitle?: string;
    tag?: string;
    threadIdentifier?: string;
    title: string;
    titleLocArgs?: string[];
    titleLocKey?: string;
    trigger: Trigger;
};
```
<b>References:</b> [MessageNotificationAttachmentProps](./react-native-tracker.messagenotificationattachmentprops.md)<!-- -->, [Trigger](./react-native-tracker.trigger.md)
