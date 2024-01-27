import test from 'ava';
import sinon from 'sinon';
import nock from 'nock';
import { HttpMethod, HttpProtocol, gotEmitter } from '../src/index';

const endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

test.before(() => {
  nock.disableNetConnect();
});

test.beforeEach(() => {
  nock(new RegExp('https*://' + endpoint))
    .filteringPath(() => '/')
    .get('/')
    .reply(200, (uri) => uri);

  nock(new RegExp('https*://' + endpoint))
    .matchHeader('content-type', 'application/json; charset=utf-8')
    .filteringRequestBody(() => '*')
    .post('/com.snowplowanalytics.snowplow/tp2', '*')
    .reply(200, (_uri: string, body: Record<string, unknown>) => (body['data'] as Array<unknown>)[0]);
});

test.afterEach(() => {
  nock.cleanAll();
});

test.serial('gotEmitter should allow anonymization headers', async (t) => {
  nock.cleanAll();

  nock(new RegExp('https*://' + endpoint), {
    reqheaders: {
      'SP-Anonymous': '*',
    },
  })
    .filteringPath(() => '/')
    .get('/')
    .once()
    .reply(200, (uri) => uri);

  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      80,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function (error, response) {
        nock.cleanAll();
        t.is(error, undefined);
        t.pass();
        if (error) reject(error);
        else resolve(response);
      },
      undefined,
      true
    );
    e.input({});
  });
});

test('gotEmitter should send an HTTP GET request', async (t) => {
  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      80,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function (error, response) {
        t.regex(response?.body as string, /\/i\?.*a=b.*/);
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
});

test('gotEmitter should send an HTTP POST request', async (t) => {
  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      undefined,
      HttpMethod.POST,
      1,
      undefined,
      undefined,
      function (error, response) {
        t.like(JSON.parse(response?.body as string), { a: 'b' });
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
});

test('gotEmitter should send an HTTPS GET request', async (t) => {
  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      443,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function (error, response) {
        t.regex(response?.body as string, /\/i\?.*a=b.*/);
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
});

test('gotEmitter should send an HTTPS POST request', async (t) => {
  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      undefined,
      HttpMethod.POST,
      1,
      undefined,
      undefined,
      function (error, response) {
        t.like(JSON.parse(response?.body as string), { a: 'b' });
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
});

test('gotEmitter should not send requests if the buffer is not full', async (t) => {
  await new Promise((resolve) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      undefined,
      HttpMethod.POST,
      undefined,
      undefined,
      undefined,
      () => t.fail('Event unexpectedly emitted')
    );
    e.input({});
    e.input({});
    e.input({});
    setTimeout(() => {
      t.pass();
      resolve(true);
    }, 250); //Give chance for emitter callback to fire
  });
});

test('gotEmitter should not send requests if the buffer is empty', async (t) => {
  await new Promise((resolve) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      undefined,
      HttpMethod.POST,
      undefined,
      undefined,
      undefined,
      () => t.fail('Event unexpectedly emitted')
    );
    e.flush();
    setTimeout(() => {
      t.pass();
      resolve(true);
    }, 250); //Give chance for emitter callback to fire
  });
});

test('gotEmitter should add STM querystring parameter when sending POST requests', async (t) => {
  const testTime = new Date('1988-12-12T12:30:00.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      undefined,
      HttpMethod.POST,
      1,
      undefined,
      undefined,
      function (error, response) {
        t.like(JSON.parse(response?.body as string), { stm: testTime.toString() });
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });

  clock.restore();
});

test('gotEmitter should add STM querystring parameter when sending GET requests', async (t) => {
  const testTime = new Date('2020-06-15T09:12:30.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      443,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function (error, response) {
        t.regex(response?.body as string, new RegExp(`/i?.*stm=${testTime}.*`));
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
  clock.restore();
});

test('gotEmitter should handle undefined callbacks on success situation', async (t) => {
  await new Promise((resolve) => {
    t.notThrows(() => {
      const e = gotEmitter(
        endpoint,
        HttpProtocol.HTTPS,
        443,
        HttpMethod.GET,
        undefined,
        undefined,
        undefined,
        undefined
      );
      e.input({ a: 'b' });
    });
    resolve(true);
  });
});

test('gotEmitter should handle undefined callbacks on failure situation', async (t) => {
  await new Promise((resolve) => {
    t.notThrows(() => {
      const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, undefined);
      e.input({ a: 'b' });
    });
    resolve(true);
  });
});

test('gotEmitter should catch error in success situation', async (t) => {
  await new Promise((resolve) => {
    t.notThrows(() => {
      const e = gotEmitter(
        endpoint,
        HttpProtocol.HTTPS,
        443,
        HttpMethod.GET,
        undefined,
        undefined,
        undefined,
        function () {
          throw new Error('test error');
        }
      );
      e.input({ a: 'b' });
    });
    resolve(true);
  });
});

test('gotEmitter should catch error in error situation', async (t) => {
  await new Promise((resolve) => {
    t.notThrows(() => {
      const e = gotEmitter(
        'invalid-url',
        HttpProtocol.HTTPS,
        443,
        HttpMethod.POST,
        1,
        undefined,
        undefined,
        function () {
          throw new Error('test error');
        }
      );
      e.input({ a: 'b' });
    });
    resolve(true);
  });
});

test('gotEmitter should pass response in success situation', async (t) => {
  await new Promise((resolve, reject) => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      443,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function (error, response) {
        t.falsy(error);
        t.truthy(response);
        if (error) reject(error);
        else resolve(response);
      }
    );
    e.input({ a: 'b' });
  });
});

test('gotEmitter should pass error in error situation', async (t) => {
  await new Promise((resolve) => {
    const e = gotEmitter(
      'invalid-url',
      HttpProtocol.HTTPS,
      443,
      HttpMethod.POST,
      1,
      undefined,
      undefined,
      function (error, response) {
        t.truthy(error);
        t.falsy(response);
        resolve(error);
      }
    );
    e.input({ a: 'b' });
  });
});
