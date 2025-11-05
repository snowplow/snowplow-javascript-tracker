# Browser Tracker Core Library - CLAUDE.md

## Module Overview

The `@snowplow/browser-tracker-core` library provides browser-specific tracking functionality built on top of tracker-core. It handles DOM interactions, browser storage, cookies, and browser-specific event tracking features.

## Core Responsibilities

- **Browser Detection**: User agent, viewport, screen detection
- **Storage Management**: Cookies, localStorage, sessionStorage
- **DOM Helpers**: Cross-domain linking, form tracking utilities
- **Session Management**: Session tracking and storage
- **Page View Tracking**: Page view IDs and activity tracking
- **Browser Plugins**: Plugin system for browser features

## Architecture Patterns

### Browser Plugin Pattern
```typescript
// ✅ Correct: Typed plugin interface
export interface BrowserPlugin {
  activateBrowserPlugin?: (tracker: BrowserTracker) => void;
  contexts?: () => Array<SelfDescribingJson>;
  logger?: (logger: Logger) => void;
  beforeTrack?: (payloadBuilder: PayloadBuilder) => void;
  afterTrack?: (payload: Payload) => void;
}

// ❌ Wrong: Untyped plugin
const plugin = { activate: (t: any) => {} };
```

### Tracker State Management
```typescript
// ✅ Correct: Shared state pattern
export interface SharedState {
  bufferFlushers: Array<(sync?: boolean) => void>;
  hasLoaded: boolean;
  registeredOnLoadHandlers: Array<Function>;
  contextProviders: Array<ContextProvider>;
}

// ❌ Wrong: Global variables
let trackerState = {}; // Avoid global state
```

### Storage Abstraction Pattern
```typescript
// ✅ Correct: Storage interface
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// ❌ Wrong: Direct localStorage access
localStorage.setItem('key', 'value'); // Use abstraction
```

## Critical Import Patterns

### Browser-Specific Exports
```typescript
// index.ts - Browser features
export * from './tracker/types';
export * from './helpers';
export * from './detectors';
export * from './proxies';
export * from './plugins';
export * from './state';
export { Tracker } from './tracker';
```

### Helper Utilities
```typescript
// ✅ Correct: Import from helpers
import { getCookieValue, setCookie } from './helpers';

// ❌ Wrong: Reimplementing browser utils
function getCookie(name: string) { /* custom */ }
```

## Cookie Management

### Cookie Storage Pattern
```typescript
// ✅ Correct: Use cookie storage abstraction
export class CookieStorage implements Storage {
  constructor(
    private cookieName: string,
    private cookieDomain?: string,
    private cookieLifetime?: number
  ) {}
  
  setItem(key: string, value: string): void {
    setCookie(this.cookieName, value, this.cookieLifetime);
  }
}

// ❌ Wrong: Direct document.cookie manipulation
document.cookie = `name=value; domain=.example.com`;
```

### ID Cookie Pattern
```typescript
// Standard ID cookie structure
interface IdCookie {
  userId: string;          // Domain user ID
  sessionId: string;       // Session ID
  sessionIndex: number;    // Session count
  eventIndex: number;      // Event count in session
  lastActivity: number;    // Last activity timestamp
}
```

## Session Management

### Session Storage Pattern
```typescript
// ✅ Correct: Session data structure
export interface SessionData {
  sessionId: string;
  previousSessionId?: string;
  sessionIndex: number;
  userId: string;
  firstEventId?: string;
  firstEventTimestamp?: number;
}

// ❌ Wrong: Unstructured session data
const session = { id: '123', data: {} };
```

### Activity Tracking
```typescript
// Activity callback configuration
export interface ActivityTrackingConfiguration {
  minimumVisitLength: number;
  heartbeatDelay: number;
  callback?: ActivityCallback;
}
```

## DOM Interaction Patterns

### Cross-Domain Linking
```typescript
// ✅ Correct: Decorator pattern
export function decorateQuerystring(
  url: string,
  name: string,
  value: string
): string {
  const [urlPath, anchor] = url.split('#');
  const [basePath, queries] = urlPath.split('?');
  // ... decoration logic
  return decorated;
}

// ❌ Wrong: String concatenation
url += '?_sp=' + value; // Fragile
```

### Form Element Helpers
```typescript
// Get form element values safely
export function getElementValue(element: HTMLElement): string | null {
  if (element instanceof HTMLInputElement) {
    return element.value;
  }
  if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return null;
}
```

## Browser Detection

### Detector Functions
```typescript
// ✅ Correct: Feature detection
export function hasLocalStorage(): boolean {
  try {
    const test = 'localStorage';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// ❌ Wrong: Assume availability
if (localStorage) { /* use it */ } // May throw
```

### Browser Properties
```typescript
// Standard browser context
export interface BrowserProperties {
  viewport: [number, number];
  documentSize: [number, number];
  resolution: [number, number];
  colorDepth: number;
  devicePixelRatio: number;
  cookieEnabled: boolean;
  online: boolean;
  browserLanguage: string;
  documentLanguage: string;
  webdriver: boolean;
}
```

## Event Queue Management

### Out Queue Pattern
```typescript
// ✅ Correct: Managed queue with retry
export class OutQueue {
  constructor(
    private readonly maxQueueSize: number,
    private readonly eventStore: EventStore
  ) {}
  
  enqueue(event: Payload): void {
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
    this.queue.push(event);
  }
}

// ❌ Wrong: Unbounded array
const events = []; // No size management
```

## Common Patterns

### Page View ID Generation
```typescript
// ✅ Correct: UUID per page view
import { v4 as uuid } from 'uuid';
export function generatePageViewId(): string {
  return uuid();
}

// ❌ Wrong: Sequential IDs
let pvId = 0;
function getPageViewId() { return ++pvId; }
```

### Local Storage Event Store
```typescript
// Event persistence pattern
export class LocalStorageEventStore implements EventStore {
  constructor(private readonly key: string) {}
  
  async add(event: EventStorePayload): Promise<number> {
    const events = this.getAll();
    events.push(event);
    localStorage.setItem(this.key, JSON.stringify(events));
    return events.length;
  }
}
```

## Testing Patterns

### Test Directory Structure
```
test/
├── tracker/              # Tracker-specific tests
│   ├── cookie_storage.test.ts
│   ├── page_view.test.ts
│   └── session_data.test.ts
├── helpers/              # Helper function tests
├── detectors.test.ts     # Browser detection tests
└── __snapshots__/        # Jest snapshots
```

### Mock Browser APIs
```typescript
// Mock storage for tests
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  
  clear(): void {
    this.store = {};
  }
}

// Mock document properties
jest.spyOn(document, 'title', 'get').mockReturnValue('Test Page');
jest.spyOn(document, 'referrer', 'get').mockReturnValue('https://referrer.com');
```

### DOM Testing
```typescript
// ✅ Correct: Setup and teardown DOM
beforeEach(() => {
  document.body.innerHTML = `
    <form id="test-form">
      <input name="field" value="test" />
      <button type="submit">Submit</button>
    </form>
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
});

// ❌ Wrong: Leave DOM dirty
beforeEach(() => {
  document.body.innerHTML += '<div>test</div>'; // Accumulates
});
```

### Testing Browser Detection
```typescript
// ✅ Correct: Mock browser features
describe('Browser detection', () => {
  it('detects localStorage support', () => {
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { setItem: mockSetItem, removeItem: jest.fn() },
      writable: true
    });
    
    expect(hasLocalStorage()).toBe(true);
  });
  
  it('handles localStorage errors', () => {
    Object.defineProperty(window, 'localStorage', {
      value: { 
        setItem: () => { throw new Error('Quota exceeded'); }
      },
      writable: true
    });
    
    expect(hasLocalStorage()).toBe(false);
  });
});
```

### Cookie Testing
```typescript
// ✅ Correct: Test cookie operations
describe('Cookie management', () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString());
    });
  });
  
  it('sets and retrieves cookies', () => {
    setCookie('test', 'value', 86400);
    expect(getCookieValue('test')).toBe('value');
  });
});
```

### Testing Helper Pattern
```typescript
// Common test helper in test/helpers.ts
export function createTracker(config?: Partial<TrackerConfiguration>) {
  const eventStore = newInMemoryEventStore();
  return addTracker('sp', 'sp', 'js-test', '', new SharedState(), {
    eventStore,
    ...config
  });
}

// Usage in tests
it('tracks page view', () => {
  const tracker = createTracker();
  tracker.trackPageView();
  // Assert...
});
```

## File Organization

```
browser-tracker-core/
├── src/
│   ├── index.ts           # Public exports
│   ├── snowplow.ts        # Main tracker factory
│   ├── state.ts           # Shared state
│   ├── plugins.ts         # Plugin system
│   ├── proxies.ts         # Proxy tracking
│   ├── detectors.ts       # Browser detection
│   ├── helpers/
│   │   ├── index.ts       # Helper exports
│   │   ├── browser_props.ts
│   │   ├── cross_domain.ts
│   │   └── storage.ts
│   └── tracker/
│       ├── index.ts       # Tracker implementation
│       ├── types.ts       # TypeScript types
│       ├── cookie_storage.ts
│       ├── id_cookie.ts
│       ├── out_queue.ts
│       └── local_storage_event_store.ts
└── test/
    └── [module].test.ts
```

## Quick Reference

### Essential Imports
```typescript
import {
  BrowserTracker,
  BrowserPlugin,
  SharedState,
  ActivityTrackingConfiguration,
  PageViewEvent,
  getCookieValue,
  decorateQuerystring,
  hasLocalStorage
} from '@snowplow/browser-tracker-core';
```

### Plugin Development Checklist
- [ ] Implement `BrowserPlugin` interface
- [ ] Store tracker reference in `activateBrowserPlugin`
- [ ] Clean up resources in cleanup hooks
- [ ] Handle browser API failures gracefully
- [ ] Test with different storage configurations

## Contributing to CLAUDE.md

When modifying browser-tracker-core:

1. **Test browser compatibility** across major browsers
2. **Handle storage failures** gracefully
3. **Respect privacy settings** (cookies, storage)
4. **Maintain IE11 compatibility** if required
5. **Document browser-specific behavior**