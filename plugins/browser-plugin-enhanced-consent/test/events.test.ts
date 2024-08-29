import { addTracker, SharedState, EventStore } from '@snowplow/browser-tracker-core';
import {
  EnhancedConsentPlugin,
  trackCmpVisible,
  trackConsentAllow,
  trackConsentSelected,
  trackConsentDeny,
  trackConsentExpired,
  trackConsentImplicit,
  trackConsentPending,
  trackConsentWithdrawn,
} from '../src';
import { CMP_VISIBLE_SCHEMA } from '../src/schemata';
import { newInMemoryEventStore } from '@snowplow/tracker-core';

const extractEventProperties = ([{ ue_pr }]: any) => ({ unstructuredEvent: JSON.parse(ue_pr).data });

describe('EnhancedConsentPlugin events', () => {
  let idx = 1;
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = newInMemoryEventStore({});
    addTracker(`sp${idx++}`, `sp${idx++}`, 'js-3.0.0', '', new SharedState(), {
      stateStorageStrategy: 'cookie',
      encodeBase64: false,
      plugins: [EnhancedConsentPlugin()],
      contexts: { webPage: false },
      eventStore,
      customFetch: async () => new Response(null, { status: 500 }),
    });
  });

  it('trackCmpVisible adds the "CMP Visible" event to the queue', async () => {
    trackCmpVisible({
      elapsedTime: 1500,
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      schema: CMP_VISIBLE_SCHEMA,
      data: { elapsedTime: 1500 },
    });
  });

  it('trackConsentAllow adds the "allow consent" event to the queue', async () => {
    trackConsentAllow({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary', 'analytics', 'functional', 'advertisement'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'allow_all',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary', 'analytics', 'functional', 'advertisement'],
        domainsApplied: ['www.example.com'],
      },
    });
  });

  it('trackConsentSelected adds the "allow selected consent" event to the queue', async () => {
    trackConsentSelected({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary', 'analytics', 'advertisement'],
      domainsApplied: ['www.example.com', 'blog.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'allow_selected',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary', 'analytics', 'advertisement'],
        domainsApplied: ['www.example.com', 'blog.example.com'],
      },
    });
  });

  it('trackConsentPending adds the "pending consent" event to the queue', async () => {
    trackConsentPending({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'pending',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary'],
        domainsApplied: ['www.example.com'],
      },
    });
  });

  it('trackConsentImplicit adds the "implicit consent" event to the queue', async () => {
    trackConsentImplicit({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'implicit_consent',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary'],
        domainsApplied: ['www.example.com'],
      },
    });
  });

  it('trackConsentExpired adds the "expired consent" event to the queue', async () => {
    trackConsentExpired({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'expired',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary'],
        domainsApplied: ['www.example.com'],
      },
    });
  });

  it('trackConsentDeny adds the "consent denied" event to the queue', async () => {
    trackConsentDeny({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'deny_all',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary'],
        domainsApplied: ['www.example.com'],
      },
    });
  });

  it('trackConsentWithdrawn adds the "consent withdrawn" event to the queue', async () => {
    trackConsentWithdrawn({
      basisForProcessing: 'consent',
      consentUrl: 'http://consent.url',
      consentVersion: '1.0.0',
      consentScopes: ['necessary'],
      domainsApplied: ['www.example.com'],
    });

    const { unstructuredEvent } = extractEventProperties(await eventStore.getAllPayloads());

    expect(unstructuredEvent).toMatchObject({
      data: {
        eventType: 'withdrawn',
        basisForProcessing: 'consent',
        consentUrl: 'http://consent.url',
        consentVersion: '1.0.0',
        consentScopes: ['necessary'],
        domainsApplied: ['www.example.com'],
      },
    });
  });
});
