import { newTracker } from '../src';
import { setEcommerceUser, SnowplowEcommercePlugin, trackProductView } from '@snowplow/browser-plugin-snowplow-ecommerce';

function createMockFetch(status: number, requests: Request[]) {
  return async (input: Request) => {
    requests.push(input);
    let response = new Response(null, { status });
    return response;
  };
}

describe('Tracking ecommerce events using the ecomerce plugin', () => {
  let requests: Request[];
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(async () => {
    requests = [];
    mockFetch = createMockFetch(200, requests);
  });

  it('tracks ecommerce events', async () => {
    const tracker = await newTracker({
      namespace: 'test',
      endpoint: 'http://localhost:9090',
      customFetch: mockFetch,
      plugins: [SnowplowEcommercePlugin()],
    });

    setEcommerceUser({
      id: 'my-user',
      email: 'my-email@email.com',
    });

    trackProductView({
      id: 'my-product',
      name: 'My Product',
      category: 'my-category',
      price: 100,
      currency: 'USD',
    })

    await tracker.flush();
    expect(requests.length).toBe(1);

    const [request] = requests;
    const payload = await request?.json();
    expect(payload.data.length).toBe(1);
    expect(payload.data[0].ue_pr).toBeDefined();
    expect(payload.data[0].ue_pr).toContain('/snowplow_ecommerce_action/');
    expect(payload.data[0].co).toBeDefined();
    expect(payload.data[0].co).toContain('My Product');
    expect(payload.data[0].co).toContain('my-email@email.com');
  });
});
