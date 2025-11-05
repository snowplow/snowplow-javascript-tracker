# Tracker Core Library - CLAUDE.md

## Module Overview

The `@snowplow/tracker-core` library provides platform-agnostic event tracking functionality. It contains the fundamental building blocks for constructing Snowplow events, managing contexts, and handling payloads. This is the foundation that all platform-specific trackers build upon.

## Core Responsibilities

- **Event Builders**: Functions to construct typed Snowplow events
- **Payload Management**: JSON and form-encoded payload construction
- **Context Handling**: Global and conditional context providers
- **Plugin System**: Core plugin architecture and lifecycle
- **Emitter Logic**: Event batching and request management

## Architecture Patterns

### Event Builder Pattern
All events follow a consistent builder pattern that returns a `PayloadBuilder`:

```typescript
// ✅ Correct: Use typed builders
export function buildPageView(event: PageViewEvent): PayloadBuilder {
  const { pageUrl, pageTitle, referrer } = event;
  return payloadBuilder()
    .add('e', 'pv')
    .add('url', pageUrl)
    .add('page', pageTitle)
    .add('refr', referrer);
}

// ❌ Wrong: Manual payload construction
function makePageView(url: string) {
  return { e: 'pv', url }; // Don't build manually
}
```

### Self-Describing JSON Pattern
```typescript
// ✅ Correct: Strongly typed SDJ
export type SelfDescribingJson<T = Record<string, unknown>> = {
  schema: string;
  data: T extends any[] ? never : T;
};

// ❌ Wrong: Loose typing
type Event = { schema: any; data: any };
```

### Timestamp ADT Pattern
```typescript
// ✅ Correct: Use discriminated union
export type Timestamp = TrueTimestamp | DeviceTimestamp | number;
export interface TrueTimestamp {
  readonly type: 'ttm';
  readonly value: number;
}

// ❌ Wrong: Ambiguous timestamp types
type Timestamp = number | { value: number };
```

## Critical Import Patterns

### Public API Exports
```typescript
// index.ts - Centralized exports
export * from './core';
export * from './contexts';
export * from './payload';
export * from './emitter';
export * from './plugins';
export { buildPageView, buildStructEvent } from './events';
```

### Internal Module Structure
```typescript
// ✅ Correct: Import from sibling modules
import { PayloadBuilder } from './payload';
import { SelfDescribingJson } from './core';

// ❌ Wrong: Circular dependencies
import { something } from '../index'; // Avoid
```

## Event Building Standards

### Standard Event Properties
```typescript
// Every event builder should accept CommonEventProperties
export interface CommonEventProperties<T = Record<string, unknown>> {
  context?: Array<SelfDescribingJson<T>> | null;
  timestamp?: Timestamp | null;
}
```

### Event Factory Pattern
```typescript
// Standard event builder structure
export function buildCustomEvent(
  event: CustomEventData
): PayloadBuilder {
  return payloadBuilder()
    .add('e', 'ue') // Event type
    .addJson('ue_px', 'ue_pr', {
      schema: EVENT_SCHEMA,
      data: processEventData(event)
    });
}
```

## Context Management

### Global Context Pattern
```typescript
// ✅ Correct: Conditional context provider
export type ConditionalContextProvider = 
  [ContextFilter, ContextPrimitive | ContextGenerator];

const globalContext: ConditionalContextProvider = [
  (event) => event.eventType === 'pv', // Filter
  { schema: '...', data: {...} }        // Context
];

// ❌ Wrong: Unfiltered global contexts
const context = { schema: '...', data: {...} }; // No filtering
```

### Plugin Context Integration
```typescript
// Plugin contexts are merged with global contexts
export function pluginContexts(): PluginContexts {
  return {
    addPluginContexts: (contexts: Array<ContextPrimitive>) => {
      // Contexts added by plugins
    }
  };
}
```

## Emitter Architecture

### Event Store Pattern
```typescript
// Event storage abstraction
export interface EventStore {
  add(payload: EventStorePayload): Promise<number>;
  count(): Promise<number>;
  getAll(): Promise<EventStorePayload[]>;
  removeHead(count: number): Promise<void>;
}
```

### Request Building
```typescript
// Batch request construction
export class EmitterRequest {
  constructor(
    events: EmitterEvent[],
    byteLimit: number
  ) {
    this.batch = this.buildBatch(events, byteLimit);
  }
}
```

## Common Patterns

### UUID Generation
```typescript
// ✅ Correct: Use uuid v4
import { v4 as uuid } from 'uuid';
const eventId = uuid();

// ❌ Wrong: Custom ID generation
const id = Math.random().toString(36);
```

### Base64 Encoding
```typescript
// Use the provided base64 utilities
import { base64urlencode } from './base64';
const encoded = base64urlencode(jsonString);
```

### Logger Pattern
```typescript
// Conditional logging
import { LOG } from './logger';
LOG.error('Error message', error);
LOG.warn('Warning message');
```

## Testing Patterns

### Mock Payload Builders
```typescript
// Test helper pattern
function createMockPayloadBuilder(): PayloadBuilder {
  return payloadBuilder()
    .add('aid', 'test-app')
    .add('p', 'web');
}
```

### Event Validation
```typescript
// Validate event structure in tests
expect(event.build()).toMatchObject({
  e: 'ue',
  ue_pr: expect.stringContaining('schema')
});
```

## Testing Patterns

### Test Directory Structure
```
test/
├── core.test.ts         # Core tracker tests
├── payload.test.ts      # Payload builder tests
├── contexts.test.ts     # Context management tests
├── emitter/             # Emitter-specific tests
└── __snapshots__/       # Jest snapshots
```

### In-Memory Event Store Pattern
```typescript
// ✅ Correct: Use in-memory store for testing
import { newInMemoryEventStore } from '@snowplow/tracker-core';

describe('Event tracking', () => {
  let eventStore: EventStore;
  
  beforeEach(() => {
    eventStore = newInMemoryEventStore();
  });
  
  it('stores events correctly', () => {
    const tracker = new TrackerCore({ eventStore });
    tracker.track(buildPageView({ pageUrl: 'test' }));
    
    const events = eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].e).toBe('pv');
  });
});
```

### Payload Builder Testing
```typescript
// ✅ Correct: Test payload construction
describe('PayloadBuilder', () => {
  it('builds valid Snowplow payload', () => {
    const payload = new PayloadBuilder()
      .add('e', 'pv')
      .add('url', 'http://example.com')
      .add('page', 'Home')
      .build();
    
    expect(payload).toEqual({
      e: 'pv',
      url: 'http://example.com',
      page: 'Home'
    });
  });
  
  it('encodes base64 for self-describing events', () => {
    const payload = buildSelfDescribingEvent({
      event: {
        schema: 'iglu:com.example/test/jsonschema/1-0-0',
        data: { key: 'value' }
      }
    });
    
    const built = payload.build();
    expect(built.ue_pr).toBeDefined();
    const decoded = JSON.parse(Buffer.from(built.ue_pr, 'base64').toString());
    expect(decoded.data.schema).toBe('iglu:com.example/test/jsonschema/1-0-0');
  });
});
```

### Context Testing
```typescript
// ✅ Correct: Test context providers
describe('Context management', () => {
  it('adds global contexts to events', () => {
    const contextProvider = () => [{
      schema: 'iglu:com.example/context/jsonschema/1-0-0',
      data: { contextKey: 'contextValue' }
    }];
    
    const tracker = new TrackerCore({
      contextProviders: [contextProvider]
    });
    
    const payload = tracker.track(buildPageView({ pageUrl: 'test' }));
    const contexts = JSON.parse(Buffer.from(payload.co, 'base64').toString());
    
    expect(contexts.data).toContainEqual(
      expect.objectContaining({
        data: { contextKey: 'contextValue' }
      })
    );
  });
});
```

### Event Builder Testing Pattern
```typescript
// ✅ Correct: Test custom event builders
function buildCustomEvent(data: CustomEventData): PayloadBuilder {
  return new PayloadBuilder()
    .add('e', 'ue')
    .add('ue_pr', buildSelfDescribingJson({
      schema: CUSTOM_EVENT_SCHEMA,
      data
    }));
}

describe('Custom event builder', () => {
  it('creates valid self-describing event', () => {
    const event = buildCustomEvent({ field: 'value' });
    const payload = event.build();
    
    expect(payload.e).toBe('ue');
    expect(JSON.parse(Buffer.from(payload.ue_pr, 'base64').toString()))
      .toMatchSnapshot();
  });
});
```

## File Organization

```
tracker-core/
├── src/
│   ├── index.ts          # Public API exports
│   ├── core.ts           # Core types and tracker
│   ├── payload.ts        # Payload builder
│   ├── contexts.ts       # Context management
│   ├── plugins.ts        # Plugin system
│   ├── base64.ts         # Encoding utilities
│   ├── logger.ts         # Logging
│   ├── schemata.ts       # Schema constants
│   └── emitter/
│       ├── index.ts      # Emitter exports
│       ├── emitter_event.ts
│       └── emitter_request.ts
└── test/
    └── [module].test.ts
```

## Quick Reference

### Essential Imports
```typescript
import {
  PayloadBuilder,
  SelfDescribingJson,
  CommonEventProperties,
  buildSelfDescribingEvent,
  buildPageView,
  buildStructEvent,
  TrackerCore
} from '@snowplow/tracker-core';
```

### Event Builder Checklist
- [ ] Accept event-specific data interface
- [ ] Return `PayloadBuilder`
- [ ] Add event type with `.add('e', 'type')`
- [ ] Handle optional CommonEventProperties
- [ ] Export from index.ts

## Contributing to CLAUDE.md

When modifying tracker-core patterns:

1. **Maintain backward compatibility** - This is a core library
2. **Update type exports** when adding new interfaces
3. **Follow builder pattern** for new event types
4. **Test payload structure** thoroughly
5. **Document schema changes** in schemata.ts