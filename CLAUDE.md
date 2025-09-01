# Snowplow JavaScript Tracker - CLAUDE.md

## Project Overview

The Snowplow JavaScript Tracker is a comprehensive analytics tracking library for web, browser, and React Native applications. It provides event tracking capabilities for sending data to Snowplow collectors. The project uses a monorepo structure managed by Rush.js with TypeScript as the primary language.

### Key Technologies
- **Language**: TypeScript/JavaScript
- **Build System**: Rush.js (monorepo) + Rollup
- **Package Manager**: pnpm (v9.7.1)
- **Testing**: Jest with jsdom
- **Target Environments**: Browser, Node.js, React Native

## Development Commands

```bash
# Install dependencies and build all packages
rush install
rush build

# Run tests
rush test          # Run all tests
rush test:unit     # Unit tests only
rush test:e2e      # E2E tests

# Build specific package
cd trackers/browser-tracker && rushx build

# Quality checks
rush lint          # ESLint
rush format        # Prettier
```

## Architecture

### System Design
The tracker follows a **layered plugin architecture** with core libraries providing fundamental tracking capabilities and plugins extending functionality for specific use cases.

```
┌─────────────────────────────────────────┐
│           Trackers Layer                │
│  (browser, javascript, node, react-native) │
├─────────────────────────────────────────┤
│           Plugins Layer                 │
│  (30+ browser plugins for features)     │
├─────────────────────────────────────────┤
│         Core Libraries Layer            │
│  (tracker-core, browser-tracker-core)   │
└─────────────────────────────────────────┘
```

### Module Organization
- **libraries/**: Core tracking functionality
  - `tracker-core`: Platform-agnostic tracking logic
  - `browser-tracker-core`: Browser-specific core features
- **trackers/**: Platform-specific tracker implementations
- **plugins/**: Feature-specific plugins (ad tracking, media, ecommerce, etc.)
- **common/**: Shared Rush.js configuration and scripts

## Core Architectural Principles

### 1. Plugin-Based Architecture
```typescript
// ✅ Correct: Plugin pattern with activation lifecycle
export function MyPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
    }
  };
}

// ❌ Wrong: Direct tracker manipulation
export function myFeature(tracker) {
  tracker.someMethod(); // Breaks encapsulation
}
```

### 2. Event Builder Pattern
```typescript
// ✅ Correct: Use builder functions for events
import { buildSelfDescribingEvent } from '@snowplow/tracker-core';
const event = buildSelfDescribingEvent({ schema, data });

// ❌ Wrong: Manual event construction
const event = { e: 'ue', ue_pr: {...} }; // Don't construct manually
```

### 3. Type-Safe Self-Describing JSON
```typescript
// ✅ Correct: Typed SelfDescribingJson
export type MyEventData = {
  field: string;
  value: number;
};
const event: SelfDescribingJson<MyEventData> = {
  schema: 'iglu:com.example/event/jsonschema/1-0-0',
  data: { field: 'test', value: 42 }
};

// ❌ Wrong: Untyped data objects
const event = { schema: '...', data: someData };
```

### 4. Workspace Dependencies
```typescript
// ✅ Correct: Use workspace protocol for internal deps
"dependencies": {
  "@snowplow/tracker-core": "workspace:*"
}

// ❌ Wrong: Version-specific internal dependencies
"dependencies": {
  "@snowplow/tracker-core": "^3.0.0"
}
```

## Layer Organization & Responsibilities

### Core Libraries (`libraries/`)
- **tracker-core**: Event building, payload construction, emitter logic
- **browser-tracker-core**: Browser APIs, storage, cookies, DOM helpers

### Trackers (`trackers/`)
- **browser-tracker**: Modern browser tracking API
- **javascript-tracker**: Legacy SP.js compatible tracker
- **node-tracker**: Server-side Node.js tracking
- **react-native-tracker**: Mobile app tracking

### Plugins (`plugins/`)
Each plugin follows the standard structure:
```
browser-plugin-*/
├── src/
│   ├── index.ts        # Plugin export & registration
│   ├── api.ts          # Public API functions
│   ├── types.ts        # TypeScript definitions
│   └── schemata.ts     # Event schemas
├── test/
├── package.json
└── rollup.config.js
```

## Critical Import Patterns

### 1. Core Imports
```typescript
// ✅ Correct: Import from package roots
import { BrowserPlugin } from '@snowplow/browser-tracker-core';
import { buildSelfDescribingEvent } from '@snowplow/tracker-core';

// ❌ Wrong: Deep imports into src
import { something } from '@snowplow/browser-tracker-core/src/helpers';
```

### 2. Plugin Registration
```typescript
// ✅ Correct: Plugin initialization pattern
import { AdTrackingPlugin } from '@snowplow/browser-plugin-ad-tracking';

newTracker('sp', 'collector.example.com', {
  plugins: [AdTrackingPlugin()]
});

// ❌ Wrong: Direct plugin function calls
AdTrackingPlugin.trackAdClick(); // Plugins need registration
```

### 3. Type Exports
```typescript
// ✅ Correct: Re-export types with functions
export { AdClickEvent, trackAdClick } from './api';

// ❌ Wrong: Forget to export event types
export { trackAdClick } from './api'; // Missing type export
```

## Essential Library Patterns

### Event Tracking Pattern
```typescript
// Standard event tracking with context
export function trackMyEvent(
  event: MyEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildMyEvent(event), event.context, event.timestamp);
  });
}
```

### Plugin State Management
```typescript
// Plugin-scoped tracker registry
const _trackers: Record<string, BrowserTracker> = {};

export function MyPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
    }
  };
}
```

### Schema Definition Pattern
```typescript
// schemata.ts - Centralized schema constants
export const MY_SCHEMA = 'iglu:com.snowplowanalytics.snowplow/my_event/jsonschema/1-0-0';

// Usage in event builders
const event: SelfDescribingJson = {
  schema: MY_SCHEMA,
  data: eventData
};
```

## Model Organization Pattern

### Event Type Definitions
```typescript
// types.ts - Event data interfaces
export interface MediaPlayerEvent {
  currentTime: number;
  duration?: number;
  ended: boolean;
  loop: boolean;
  // ... other fields
}

// Composite types for API
export type MediaTrackEvent = MediaPlayerEvent & {
  eventType: MediaEventType;
  label?: string;
};
```

### Context Builders
```typescript
// Context creation pattern
export function buildMediaContext(player: MediaPlayer): SelfDescribingJson {
  return {
    schema: MEDIA_PLAYER_SCHEMA,
    data: {
      currentTime: player.currentTime,
      duration: player.duration,
      // ... map player state
    }
  };
}
```

## Common Pitfalls & Solutions

### 1. Forgetting Plugin Registration
```typescript
// ❌ Wrong: Using plugin API without registration
import { trackAdClick } from '@snowplow/browser-plugin-ad-tracking';
trackAdClick(event); // Error: _trackers is empty

// ✅ Correct: Register plugin first
import { AdTrackingPlugin, trackAdClick } from '@snowplow/browser-plugin-ad-tracking';
newTracker('sp', 'collector.example.com', {
  plugins: [AdTrackingPlugin()]
});
trackAdClick(event); // Works correctly
```

### 2. Incorrect Timestamp Types
```typescript
// ❌ Wrong: String timestamps
event.timestamp = '2024-01-01T00:00:00Z';

// ✅ Correct: Use Timestamp ADT
event.timestamp = { type: 'ttm', value: Date.now() };
// or just number for device timestamp
event.timestamp = Date.now();
```

### 3. Manual Payload Construction
```typescript
// ❌ Wrong: Building payloads manually
const payload = {
  e: 'se',
  se_ca: 'category',
  se_ac: 'action'
};

// ✅ Correct: Use builder functions
const payload = buildStructEvent({
  category: 'category',
  action: 'action'
});
```

## File Structure Template

### New Plugin Structure
```
plugins/browser-plugin-[feature]/
├── src/
│   ├── index.ts           # Plugin export
│   ├── api.ts             # Public tracking functions
│   ├── types.ts           # TypeScript interfaces
│   ├── schemata.ts        # Schema constants
│   └── contexts.ts        # Context builders
├── test/
│   └── [feature].test.ts  # Jest tests
├── package.json           # Workspace package
├── tsconfig.json          # TypeScript config
├── rollup.config.js       # Build configuration
└── README.md              # Documentation
```

## Testing Patterns

### Test Directory Structure
Each package maintains its own `test/` directory with TypeScript test files:
```
package/
├── test/
│   ├── *.test.ts           # Unit tests
│   ├── integration/         # Integration tests
│   ├── functional/          # E2E/browser tests
│   └── __snapshots__/       # Jest snapshots
```

### Test File Naming Conventions
```typescript
// ✅ Correct: Descriptive test file names
events.test.ts              // Testing event functions
contexts.test.ts            // Testing context builders
browser_props.test.ts       // Testing browser properties

// ❌ Wrong: Generic or unclear names
test.test.ts               // Too generic
unit.test.ts              // Not descriptive
```

### Test Suite Structure
```typescript
// ✅ Correct: Nested describe blocks with clear naming
describe('AdTrackingPlugin', () => {
  describe('#trackAdClick', () => {
    it('tracks click event with correct schema', () => {});
    it('includes required fields in payload', () => {});
  });
});

// ❌ Wrong: Flat structure without context
describe('tests', () => {
  it('test1', () => {});
  it('test2', () => {});
});
```

### Common Test Utilities
```typescript
// Using lodash/fp for test data extraction
import F from 'lodash/fp';

const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('e'))));
const extractEventProperties = F.map(F.compose(
  F.get('data'),
  (cx: string) => JSON.parse(cx),
  F.get('ue_pr')
));
```

### Mock Setup Pattern
```typescript
// Standard mock configuration in tests
beforeAll(() => {
  jest.spyOn(document, 'title', 'get').mockReturnValue('Test Title');
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset tracker state between tests
});
```

### Snapshot Testing
```typescript
// ✅ Correct: Snapshot for complex objects
expect(buildMediaContext(player)).toMatchSnapshot();

// ❌ Wrong: Snapshot for simple values
expect(event.id).toMatchSnapshot(); // Use toBe() instead
```

### Test Categories & Best Practices

#### 1. Unit Tests
Test individual functions and modules in isolation:
```typescript
// ✅ Correct: Testing pure functions
it('makeDimension correctly floors dimension type values', () => {
  expect(makeDimension(800.5)).toBe(800);
  expect(makeDimension('not-a-number')).toBe(0);
});
```

#### 2. Integration Tests
Test multi-component interactions:
```typescript
// ✅ Correct: Testing plugin integration with tracker
it('registers plugin and tracks events', () => {
  const tracker = createTracker({ plugins: [MyPlugin()] });
  trackMyEvent({ data: 'test' });
  expect(eventStore.getEvents()).toHaveLength(1);
});
```

#### 3. Functional/E2E Tests
Browser automation tests for full tracker behavior:
```typescript
// Located in test/functional/
it('persists session across page reloads', async () => {
  await browser.url('/test-page');
  const sessionId = await browser.execute(() => tracker.getSessionId());
  await browser.refresh();
  const newSessionId = await browser.execute(() => tracker.getSessionId());
  expect(sessionId).toBe(newSessionId);
});
```

### Testing Configuration

#### Jest Configuration Pattern
```javascript
// jest.config.js - Standard config for packages
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../setupTestGlobals.ts'],
  reporters: ['jest-standard-reporter']
};
```

#### Global Test Setup
```typescript
// setupTestGlobals.ts - Shared test utilities
import 'whatwg-fetch';
global.crypto = {
  getRandomValues: (buffer) => nodeCrypto.randomFillSync(buffer)
};
```

### Event Store Testing Pattern
```typescript
// ✅ Correct: Using in-memory event store for tests
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const eventStore = newInMemoryEventStore();
const tracker = createTracker({ eventStore });
// Verify events: eventStore.getEvents()
```

### Testing Async Behavior
```typescript
// ✅ Correct: Testing timer-based functionality
it('sends ping event after interval', async () => {
  jest.useFakeTimers();
  startPingInterval(player, 30);
  jest.advanceTimersByTime(30000);
  await Promise.resolve(); // Allow async operations
  expect(trackMediaPing).toHaveBeenCalled();
  jest.useRealTimers();
});
```

## Quick Reference

### Import Checklist
- [ ] Import from package root, not `/src`
- [ ] Include type exports with functions
- [ ] Use `workspace:*` for internal dependencies
- [ ] Import builders from `@snowplow/tracker-core`
- [ ] Import browser utils from `@snowplow/browser-tracker-core`

### Common Tasks

```typescript
// Create new tracker
import { newTracker } from '@snowplow/browser-tracker';
newTracker('sp', 'collector.example.com', { 
  appId: 'my-app',
  plugins: [/* plugins */]
});

// Track custom event
import { trackSelfDescribingEvent } from '@snowplow/browser-tracker';
trackSelfDescribingEvent({
  event: {
    schema: 'iglu:com.example/event/jsonschema/1-0-0',
    data: { /* event data */ }
  }
});

// Add global context
import { addGlobalContexts } from '@snowplow/browser-tracker';
addGlobalContexts([{
  schema: 'iglu:com.example/context/jsonschema/1-0-0',
  data: { /* context data */ }
}]);

// Test a tracker with in-memory event store
import { createTracker } from '../helpers';
import { newInMemoryEventStore } from '@snowplow/tracker-core';
const eventStore = newInMemoryEventStore();
const tracker = createTracker({ eventStore });
```

## Contributing to CLAUDE.md

When adding or updating content in this document, please follow these guidelines:

### File Size Limit
- **CLAUDE.md must not exceed 40KB** (currently ~11KB)
- Check file size after updates: `wc -c CLAUDE.md`
- Remove outdated content if approaching the limit

### Code Examples
- Keep all code examples **4 lines or fewer**
- Focus on the essential pattern, not complete implementations
- Use `// ❌` and `// ✅` to clearly show wrong vs right approaches

### Content Organization
- Add new patterns to existing sections when possible
- Create new sections sparingly to maintain structure
- Update the architectural principles section for major changes
- Ensure examples follow current codebase conventions

### Quality Standards
- Test any new patterns in actual code before documenting
- Verify imports and syntax are correct for the codebase
- Keep language concise and actionable
- Focus on "what" and "how", minimize "why" explanations

### Multiple CLAUDE.md Files
- **Directory-specific CLAUDE.md files** can be created for specialized modules
- Follow the same structure and guidelines as this root CLAUDE.md
- Keep them focused on directory-specific patterns and conventions
- Maximum 20KB per directory-specific CLAUDE.md file

### Instructions for LLMs
When editing files in this repository, **always check for CLAUDE.md guidance**:

1. **Look for CLAUDE.md in the same directory** as the file being edited
2. **If not found, check parent directories** recursively up to project root
3. **Follow the patterns and conventions** described in the applicable CLAUDE.md
4. **Prioritize directory-specific guidance** over root-level guidance when conflicts exist