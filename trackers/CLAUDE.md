# Platform Trackers - CLAUDE.md

## Tracker Implementations Overview

The `trackers/` directory contains platform-specific implementations that build upon the core libraries. Each tracker is optimized for its target environment while maintaining API consistency across platforms.

## Tracker Types

### 1. Browser Tracker (`browser-tracker`)
Modern browser tracking with full TypeScript support and tree-shaking:
```typescript
// ✅ Correct: Modern import syntax
import { newTracker, trackPageView } from '@snowplow/browser-tracker';

// ❌ Wrong: Legacy global access
window.snowplow('newTracker', ...); // Use imports
```

### 2. JavaScript Tracker (`javascript-tracker`)
Legacy SP.js compatible tracker for backward compatibility:
```typescript
// Legacy API maintained for compatibility
window.snowplow('newTracker', 'sp', 'collector.example.com');
window.snowplow('trackPageView');
```

### 3. Node Tracker (`node-tracker`)
Server-side tracking for Node.js applications:
```typescript
// ✅ Correct: Node-specific implementation
import { tracker } from '@snowplow/node-tracker';
const t = tracker(emitters, 'namespace', 'appId');

// ❌ Wrong: Browser APIs in Node
window.snowplow(...); // Not available in Node
```

### 4. React Native Tracker (`react-native-tracker`)
Mobile app tracking with React Native specific features:
```typescript
// ✅ Correct: React Native patterns
import { createTracker } from '@snowplow/react-native-tracker';
const t = createTracker('namespace', {
  endpoint: 'collector.example.com',
  method: 'post'
});
```

## Browser Tracker Patterns

### Initialization Pattern
```typescript
// ✅ Correct: Typed configuration
import { newTracker, BrowserTracker } from '@snowplow/browser-tracker';

newTracker('sp1', 'collector.example.com', {
  appId: 'my-app',
  platform: 'web',
  cookieDomain: '.example.com',
  discoverRootDomain: true,
  plugins: [/* plugins */]
});

// ❌ Wrong: Untyped config
newTracker('sp1', 'collector.example.com', {
  someOption: 'value' // Type error
});
```

### Plugin Integration
```typescript
// ✅ Correct: Plugin array in config
import { PerformanceTimingPlugin } from '@snowplow/browser-plugin-performance-timing';
import { ErrorTrackingPlugin } from '@snowplow/browser-plugin-error-tracking';

newTracker('sp', 'collector.example.com', {
  plugins: [
    PerformanceTimingPlugin(),
    ErrorTrackingPlugin()
  ]
});

// ❌ Wrong: Adding plugins after initialization
const t = newTracker('sp', 'collector.example.com');
t.addPlugin(plugin); // Not supported
```

### Multi-Tracker Pattern
```typescript
// ✅ Correct: Named trackers with specific targeting
newTracker('marketing', 'marketing.collector.com');
newTracker('product', 'product.collector.com');

trackPageView({}, ['marketing']); // Only marketing
trackPageView({}, ['product']);   // Only product
trackPageView({});                 // All trackers

// ❌ Wrong: Assuming single tracker
trackPageView(); // Which tracker?
```

## JavaScript Tracker (Legacy)

### Global Queue Pattern
```typescript
// ✅ Correct: Queue-based API
window.snowplow = window.snowplow || [];
window.snowplow.push(['newTracker', 'sp', 'collector.example.com']);
window.snowplow.push(['trackPageView']);

// ❌ Wrong: Direct function calls before load
window.snowplow('trackPageView'); // May not be ready
```

### Async Loading Pattern
```typescript
// ✅ Correct: Async script loading
(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)};
p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,'script','//cdn.jsdelivr.net/npm/@snowplow/javascript-tracker@latest/dist/sp.js','snowplow'));
```

### Bundle Size Optimization
```typescript
// sp.js - Full bundle with common plugins
// sp.lite.js - Minimal bundle, add plugins as needed
<script src="sp.lite.js"></script>
<script src="plugins/link-click-tracking.js"></script>
```

## Node Tracker Patterns

### Emitter Configuration
```typescript
// ✅ Correct: Node-specific emitter
import { gotEmitter, tracker } from '@snowplow/node-tracker';

const emitter = gotEmitter({
  endpoint: 'collector.example.com',
  protocol: 'https',
  bufferSize: 5,
  retries: 3
});

const t = tracker(emitter, 'namespace', 'appId');

// ❌ Wrong: Browser emitter in Node
import { Emitter } from '@snowplow/browser-tracker-core';
```

### Server-Side Events
```typescript
// ✅ Correct: Server context
t.track(buildPageView({
  pageUrl: req.url,
  referrer: req.headers.referer,
  userAgent: req.headers['user-agent']
}), [{
  schema: 'iglu:com.example/server_context/jsonschema/1-0-0',
  data: {
    requestId: req.id,
    serverTime: Date.now()
  }
}]);

// ❌ Wrong: Browser APIs
t.track(buildPageView({
  pageUrl: window.location.href // Not available
}));
```

## React Native Tracker Patterns

### Platform-Specific Plugins
```typescript
// ✅ Correct: Mobile-specific plugins
import { 
  InstallTracker,
  ScreenViewTracker,
  AppLifecycleTracker 
} from '@snowplow/react-native-tracker';

const tracker = createTracker('namespace', config, {
  plugins: [
    InstallTracker(),
    ScreenViewTracker(),
    AppLifecycleTracker()
  ]
});

// ❌ Wrong: Browser plugins in React Native
import { LinkClickTracking } from '@snowplow/browser-plugin-link-click-tracking';
```

### Native Bridge Pattern
```typescript
// ✅ Correct: Platform detection
import { Platform } from 'react-native';

const config = {
  endpoint: 'collector.example.com',
  method: Platform.OS === 'ios' ? 'post' : 'get'
};

// ❌ Wrong: Assuming platform
const config = { method: 'post' }; // What about Android?
```

### Async Storage Integration
```typescript
// ✅ Correct: React Native storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const tracker = createTracker('namespace', {
  endpoint: 'collector.example.com',
  sessionContext: true,
  applicationContext: true,
  platformContext: true
});

// ❌ Wrong: Browser storage
localStorage.setItem(...); // Not available
```

## Common Tracker Patterns

### Event Context Pattern
```typescript
// ✅ Correct: Structured contexts
trackStructEvent({
  category: 'video',
  action: 'play',
  label: 'tutorial',
  property: 'intro',
  value: 1.5
}, [{
  schema: 'iglu:com.example/video_context/jsonschema/1-0-0',
  data: { videoId: '123', duration: 120 }
}]);

// ❌ Wrong: Unstructured data
trackEvent('video', 'play', { videoId: '123' });
```

### Batch Configuration
```typescript
// ✅ Correct: Platform-appropriate batching
// Browser - smaller batches, more frequent
{ bufferSize: 1, maxPostBytes: 40000 }

// Node - larger batches, less frequent  
{ bufferSize: 10, maxPostBytes: 100000 }

// React Native - mobile-optimized
{ bufferSize: 5, maxPostBytes: 50000 }
```

## Testing Patterns

### Test Organization by Tracker Type
```
trackers/
├── browser-tracker/test/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── javascript-tracker/test/
│   ├── integration/    # Snowplow Micro tests
│   └── functional/     # Browser automation tests
├── node-tracker/test/
│   └── *.test.ts      # Node-specific tests
└── react-native-tracker/test/
    └── *.test.ts      # RN-specific tests
```

### Browser Tracker Tests
```typescript
// ✅ Correct: Complete browser environment mock
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  referrer: 'http://example.com',
  contentType: 'text/html'
});

global.window = dom.window;
global.document = window.document;
global.navigator = window.navigator;

// ❌ Wrong: Partial mocks
global.window = { location: {} }; // Missing properties
```

### Integration Testing with Snowplow Micro
```typescript
// ✅ Correct: Test against local collector
describe('Snowplow Micro integration', () => {
  const microUrl = 'http://localhost:9090';
  
  beforeAll(async () => {
    // Ensure Micro is running
    await fetch(`${microUrl}/micro/all`);
  });
  
  it('sends events to collector', async () => {
    newTracker('sp', `${microUrl}`, { bufferSize: 1 });
    trackPageView();
    
    // Wait for event to be sent
    await new Promise(r => setTimeout(r, 100));
    
    // Verify in Micro
    const response = await fetch(`${microUrl}/micro/all`);
    const data = await response.json();
    expect(data.total).toBeGreaterThan(0);
  });
});
```

### Functional/E2E Browser Tests
```typescript
// ✅ Correct: WebdriverIO test pattern
describe('Activity tracking', () => {
  it('tracks time on page', async () => {
    await browser.url('/test-page.html');
    
    // Enable activity tracking
    await browser.execute(() => {
      window.snowplow('enableActivityTracking', {
        minimumVisitLength: 10,
        heartbeatDelay: 10
      });
    });
    
    // Wait for activity
    await browser.pause(11000);
    
    // Check for ping event
    const events = await browser.execute(() => window.capturedEvents);
    const pingEvent = events.find(e => e.e === 'pp');
    expect(pingEvent).toBeDefined();
  });
});
```

### Node Tracker Tests
```typescript
// ✅ Correct: Mock HTTP with nock
import nock from 'nock';
import { tracker, gotEmitter } from '@snowplow/node-tracker';

describe('Node tracker', () => {
  let scope: nock.Scope;
  
  beforeEach(() => {
    scope = nock('https://collector.example.com')
      .post('/com.snowplowanalytics.snowplow/tp2')
      .reply(200);
  });
  
  afterEach(() => {
    nock.cleanAll();
  });
  
  it('sends batch of events', async () => {
    const emitter = gotEmitter({ 
      endpoint: 'collector.example.com',
      bufferSize: 2
    });
    const t = tracker(emitter, 'namespace', 'appId');
    
    t.trackPageView({ pageUrl: 'http://example.com' });
    t.trackPageView({ pageUrl: 'http://example.com/page2' });
    
    await t.flush();
    expect(scope.isDone()).toBe(true);
  });
});
```

### React Native Tests
```typescript
// ✅ Correct: Mock RN dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios)
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 })
  }
}));

describe('React Native tracker', () => {
  it('uses mobile-specific configuration', () => {
    const tracker = createTracker('namespace', {
      endpoint: 'collector.example.com'
    });
    
    expect(tracker.getSubjectData()).toMatchObject({
      platform: 'mob'
    });
  });
});
```

### Performance Testing
```typescript
// ✅ Correct: Measure bundle impact
it('keeps bundle size under limit', () => {
  const stats = require('../dist/stats.json');
  const maxSize = 50 * 1024; // 50KB
  
  expect(stats.bundleSize).toBeLessThan(maxSize);
});
```

## Performance Optimization

### Tree Shaking (Browser Tracker)
```typescript
// ✅ Correct: Named imports for tree shaking
import { trackPageView, trackStructEvent } from '@snowplow/browser-tracker';

// ❌ Wrong: Importing everything
import * as snowplow from '@snowplow/browser-tracker';
```

### Code Splitting (JavaScript Tracker)
```typescript
// ✅ Correct: Load plugins on demand
if (needsMediaTracking) {
  import('@snowplow/browser-plugin-media-tracking').then(({ MediaTrackingPlugin }) => {
    // Use plugin
  });
}
```

## Quick Reference

### Tracker Initialization
```typescript
// Browser Tracker
import { newTracker } from '@snowplow/browser-tracker';
newTracker('sp', 'collector.com', config);

// JavaScript Tracker  
window.snowplow('newTracker', 'sp', 'collector.com', config);

// Node Tracker
import { tracker, gotEmitter } from '@snowplow/node-tracker';
const t = tracker(gotEmitter(config), 'namespace', 'appId');

// React Native Tracker
import { createTracker } from '@snowplow/react-native-tracker';
const t = createTracker('namespace', config);
```

## Contributing to CLAUDE.md

When working with trackers:

1. **Maintain platform separation** - Don't mix browser/node APIs
2. **Use appropriate storage** for each platform
3. **Test with platform-specific mocks**
4. **Optimize for platform constraints** (bundle size, network, battery)
5. **Document platform-specific behavior** clearly