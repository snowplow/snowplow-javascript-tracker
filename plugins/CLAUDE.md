# Browser Plugins - CLAUDE.md

## Plugin Architecture Overview

Browser plugins extend the core tracking functionality with feature-specific capabilities. Each plugin follows a consistent pattern for registration, state management, and API exposure. Plugins are self-contained modules that integrate seamlessly with the tracker lifecycle.

## Core Plugin Pattern

### Plugin Structure Template
```typescript
// ✅ Correct: Standard plugin structure
import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';

const _trackers: Record<string, BrowserTracker> = {};

export function MyPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
    }
  };
}

// ❌ Wrong: Global state without cleanup
let tracker: BrowserTracker; // Global leak
```

### API Function Pattern
```typescript
// ✅ Correct: Dispatch to registered trackers
export function trackMyEvent(
  event: MyEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildMyEvent(event), event.context, event.timestamp);
  });
}

// ❌ Wrong: Single tracker assumption
export function trackEvent(event: MyEvent) {
  tracker.track(event); // Which tracker?
}
```

## Plugin Categories

### 1. Event Tracking Plugins
Plugins that add new event types:
- `browser-plugin-ad-tracking`: Ad impressions, clicks, conversions
- `browser-plugin-media-tracking`: Video/audio player events
- `browser-plugin-ecommerce`: Transaction and item tracking
- `browser-plugin-error-tracking`: JavaScript error capture

### 2. Context Enhancement Plugins
Plugins that add contextual data:
- `browser-plugin-client-hints`: Browser client hints
- `browser-plugin-timezone`: Timezone information
- `browser-plugin-geolocation`: Location data
- `browser-plugin-ga-cookies`: Google Analytics cookies

### 3. Behavior Tracking Plugins
Plugins that track user interactions:
- `browser-plugin-form-tracking`: Form interactions
- `browser-plugin-link-click-tracking`: Link clicks
- `browser-plugin-button-click-tracking`: Button clicks
- `browser-plugin-element-tracking`: General element visibility

### 4. Performance Plugins
Plugins for performance monitoring:
- `browser-plugin-performance-timing`: Page load performance
- `browser-plugin-web-vitals`: Core Web Vitals
- `browser-plugin-performance-navigation-timing`: Navigation timing

## Common Plugin Patterns

### Schema Definition
```typescript
// schemata.ts - Centralized schemas
export const AD_CLICK_SCHEMA = 
  'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0';
export const AD_IMPRESSION_SCHEMA = 
  'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0';
```

### Event Builder Integration
```typescript
// ✅ Correct: Use core builders
import { buildSelfDescribingEvent } from '@snowplow/tracker-core';

function buildAdClick(event: AdClickEvent): PayloadBuilder {
  return buildSelfDescribingEvent({
    event: {
      schema: AD_CLICK_SCHEMA,
      data: cleanAdClickData(event)
    }
  });
}

// ❌ Wrong: Custom payload construction
function buildAdClick(event: AdClickEvent) {
  return { e: 'ue', data: event }; // Non-standard
}
```

### Configuration Options
```typescript
// ✅ Correct: Typed configuration
export interface MediaTrackingConfiguration {
  captureEvents?: MediaEventType[];
  boundaries?: number[];
  volumeChangeTrackingInterval?: number;
}

export function MediaTrackingPlugin(
  config: MediaTrackingConfiguration = {}
): BrowserPlugin {
  const settings = { ...defaultConfig, ...config };
  // Plugin implementation
}

// ❌ Wrong: Untyped config
export function Plugin(config: any) { }
```

### DOM Observer Pattern
```typescript
// ✅ Correct: Managed observers
export function FormTrackingPlugin(): BrowserPlugin {
  let observer: MutationObserver | null = null;
  
  return {
    activateBrowserPlugin: (tracker) => {
      observer = new MutationObserver(handleMutations);
      observer.observe(document, { childList: true });
    },
    contexts: () => {
      // Cleanup on context request if needed
      observer?.disconnect();
      return [];
    }
  };
}

// ❌ Wrong: Unmanaged observers
new MutationObserver(callback).observe(document, {}); // Leak
```

## Plugin State Management

### Tracker Registry
```typescript
// ✅ Correct: Scoped tracker storage
const _trackers: Record<string, BrowserTracker> = {};
const _configurations: WeakMap<BrowserTracker, Config> = new WeakMap();

// ❌ Wrong: Global configuration
let globalConfig: Config; // Affects all trackers
```

### Element Tracking State
```typescript
// ✅ Correct: WeakMap for DOM references
const elementStates = new WeakMap<Element, ElementState>();

// ❌ Wrong: Memory leak potential
const elementStates: Map<Element, ElementState> = new Map();
```

## Event API Standards

### Standard Event Interface
```typescript
// ✅ Correct: Consistent event structure
export interface MediaPlayerEvent {
  currentTime: number;
  duration?: number;
  ended: boolean;
  loop: boolean;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  volume: number;
}

// ❌ Wrong: Inconsistent naming
export interface VideoData {
  time: number;      // Should be currentTime
  length?: number;   // Should be duration
}
```

### Optional Properties Pattern
```typescript
// ✅ Correct: Clear optionality
export interface AdClickEvent {
  targetUrl: string;
  clickId?: string;
  costModel?: 'cpa' | 'cpc' | 'cpm';
  cost?: number;
  bannerId?: string;
  zoneId?: string;
  impressionId?: string;
  advertiserId?: string;
  campaignId?: string;
}

// ❌ Wrong: Everything optional
export interface AdEvent {
  targetUrl?: string; // Required field as optional
}
```

## Context Building

### Dynamic Context Pattern
```typescript
// ✅ Correct: Context from current state
export function getMediaContext(player: HTMLMediaElement): SelfDescribingJson {
  return {
    schema: MEDIA_PLAYER_SCHEMA,
    data: {
      currentTime: player.currentTime,
      duration: player.duration || null,
      ended: player.ended,
      paused: player.paused
    }
  };
}

// ❌ Wrong: Stale context
const context = { /* captured once */ };
```

## Testing Plugin Patterns

### Test File Organization
```
plugin/test/
├── events.test.ts       # Event tracking tests
├── contexts.test.ts     # Context builder tests
├── api.test.ts          # Public API tests
└── __snapshots__/       # Jest snapshot files
```

### Mock Tracker Setup
```typescript
// Standard test setup with event store
import { addTracker, SharedState } from '@snowplow/browser-tracker-core';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

describe('MyPlugin', () => {
  let eventStore = newInMemoryEventStore();
  
  beforeEach(() => {
    SharedState.clear();
    eventStore = newInMemoryEventStore();
    addTracker('sp', 'sp', 'js-test', '', new SharedState(), {
      eventStore,
      plugins: [MyPlugin()]
    });
  });
});
```

### Event Extraction Utilities
```typescript
// Common lodash/fp patterns for test assertions
import F from 'lodash/fp';

const getUEEvents = F.compose(
  F.filter(F.compose(F.eq('ue'), F.get('e')))
);

const extractEventProperties = F.map(
  F.compose(
    F.get('data'),
    (cx: string) => JSON.parse(cx),
    F.get('ue_pr')
  )
);

// Extract specific schema events
const extractUeEvent = (schema: string) => ({
  from: F.compose(
    F.first,
    F.filter(F.compose(F.eq(schema), F.get('schema'))),
    F.flatten,
    extractEventProperties,
    getUEEvents
  )
});
```

### Event Verification Patterns
```typescript
// ✅ Correct: Verify event schema and data
it('tracks ad click with correct schema', () => {
  trackAdClick({ targetUrl: 'https://example.com' });
  
  const events = eventStore.getEvents();
  const adClickEvent = extractUeEvent(AD_CLICK_SCHEMA).from(events);
  
  expect(adClickEvent).toMatchObject({
    targetUrl: 'https://example.com'
  });
});

// ❌ Wrong: Testing implementation details
it('calls internal function', () => {
  expect(internalFunction).toHaveBeenCalled(); // Don't test internals
});
```

### Context Testing
```typescript
// ✅ Correct: Test context generation
it('generates media player context', () => {
  const player = document.createElement('video');
  player.currentTime = 30;
  player.duration = 100;
  
  const context = buildMediaContext(player);
  expect(context.data).toMatchObject({
    currentTime: 30,
    duration: 100
  });
});
```

### Snapshot Testing for Complex Objects
```typescript
// ✅ Correct: Snapshot for schema validation
it('builds correct event structure', () => {
  const event = buildAdClickEvent({
    targetUrl: 'https://example.com',
    clickId: '123'
  });
  expect(event).toMatchSnapshot();
});
```

## Plugin Development Checklist

- [ ] Implement `BrowserPlugin` interface
- [ ] Create tracker registry with `_trackers`
- [ ] Define TypeScript interfaces for events
- [ ] Add schema constants to `schemata.ts`
- [ ] Implement tracking functions with `dispatchToTrackersInCollection`
- [ ] Export both plugin and API functions from index.ts
- [ ] Handle configuration options with defaults
- [ ] Clean up resources (observers, timers) properly
- [ ] Add comprehensive Jest tests
- [ ] Document usage in README.md

## Common Pitfalls

### 1. Forgetting Tracker Registration
```typescript
// ❌ Wrong: API without plugin
import { trackAdClick } from '@snowplow/browser-plugin-ad-tracking';
trackAdClick(event); // Error: _trackers empty

// ✅ Correct: Register plugin first
import { AdTrackingPlugin } from '@snowplow/browser-plugin-ad-tracking';
newTracker('sp', 'collector', { plugins: [AdTrackingPlugin()] });
```

### 2. Memory Leaks
```typescript
// ❌ Wrong: Unremoved listeners
element.addEventListener('click', handler);

// ✅ Correct: Cleanup in plugin lifecycle
return {
  activateBrowserPlugin: (tracker) => {
    element.addEventListener('click', handler);
  },
  contexts: () => {
    element.removeEventListener('click', handler);
    return [];
  }
};
```

## Quick Reference

### Plugin File Structure
```
browser-plugin-[name]/
├── src/
│   ├── index.ts        # Plugin & API exports
│   ├── api.ts          # Tracking functions
│   ├── types.ts        # TypeScript interfaces
│   ├── schemata.ts     # Schema constants
│   └── contexts.ts     # Context builders
├── test/
│   └── [name].test.ts  # Jest tests
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## Contributing to CLAUDE.md

When creating or modifying plugins:

1. **Follow the standard plugin pattern** for consistency
2. **Export all public types** from index.ts
3. **Use workspace protocol** for dependencies
4. **Test with multiple trackers** to ensure isolation
5. **Document configuration options** clearly