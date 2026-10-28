import {
  asyncCookieStorage,
  CookieStorage,
  newCookieStorage,
  syncCookieStorage,
} from '../../src/tracker/cookie_storage';
import { createTracker } from '../helpers';

test('cookieStorage sets, gets, and deletes value', () => {
  const cookieStorage = newCookieStorage();
  cookieStorage.setCookie('test', 'value');
  expect(cookieStorage.getCookie('test')).toBe('value');

  cookieStorage.deleteCookie('test');
  expect(cookieStorage.getCookie('test')).toBeFalsy();
});

test('cookieStorage sets value with ttl and clears cache after ttl', (done) => {
  const cookieStorage = newCookieStorage();
  const ttl = 1;
  cookieStorage.setCookie('test', 'value', ttl);

  expect(cookieStorage.getCookie('test')).toBe('value');

  setTimeout(() => {
    expect(cookieStorage.getCookie('test')).toBeFalsy();
    done();
  }, ttl * 1000 + 100);
});

test('cookieStorage sets value with path, domain, samesite, and secure', () => {
  const cookieStorage = newCookieStorage();
  const path = '/';
  const domain = 'example.com';
  const samesite = 'Strict';
  const secure = true;

  cookieStorage.setCookie('test', 'value', undefined, path, domain, samesite, secure);
  expect(cookieStorage.getCookie('test')).toBe('value');
});

test('cookieStorage sets value with synchronous cookie write', () => {
  const cookieStorage = syncCookieStorage;
  cookieStorage.setCookie('test', 'value');
  expect(cookieStorage.getCookie('test')).toBe('value');
});

test('asyncCookieStorage flushes pending cookies', () => {
  let cookieJar = '';

  jest.spyOn(document, 'cookie', 'set').mockImplementation((cookieValue) => {
    cookieJar = cookieValue;
  });

  asyncCookieStorage.setCookie('test', 'value');
  expect(cookieJar).toBe('');
  asyncCookieStorage.flush();
  expect(cookieJar).toBe('test=value');
});

test('writes the latest cookie value', (done) => {
  let cookieJar = '';

  jest.spyOn(document, 'cookie', 'set').mockImplementation((cookieValue) => {
    cookieJar = cookieValue;
  });

  for (let i = 0; i < 100; i++) {
    asyncCookieStorage.setCookie('test', `value${i}`);
  }
  setTimeout(() => {
    expect(cookieJar).toBe('test=value99');
    done();
  }, 100);
});

describe('custom cookieStorage', () => {
  let cookieJar: string;

  beforeEach(() => {
    cookieJar = '';
    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookieValue) => {
      cookieJar += cookieValue + ';';
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renamingCookieStorage: CookieStorage = {
    ...syncCookieStorage,
    getCookie: (name) => syncCookieStorage.getCookie(`renamed${name}`),
    setCookie: (name, ...rest) => syncCookieStorage.setCookie(`renamed${name}`, ...rest),
    deleteCookie: (name, ...rest) => syncCookieStorage.deleteCookie(`renamed${name}`, ...rest),
  };

  test('the tracker writes its cookies through the configured storage', () => {
    createTracker({ cookieStorage: renamingCookieStorage });

    expect(cookieJar).toContain('renamed_sp_id.');
    expect(cookieJar).toContain('renamed_sp_ses.');
    expect(cookieJar).not.toMatch(/(^|;\s*)_sp_id\./);
  });

  test('the tracker deletes its cookies through the configured storage', () => {
    const storage = { ...renamingCookieStorage, deleteCookie: jest.fn() };
    const tracker = createTracker({ cookieStorage: storage });

    tracker?.clearUserData();

    const deletedNames = storage.deleteCookie.mock.calls.map(([name]) => name);
    expect(deletedNames).toEqual(
      expect.arrayContaining([expect.stringMatching(/^_sp_id\./), expect.stringMatching(/^_sp_ses\./)])
    );
  });
});
