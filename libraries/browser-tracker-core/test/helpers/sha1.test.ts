import { sha1 } from '../../src/helpers/sha1';

describe('sha1', () => {
  // RFC 3174 test vectors
  test('empty string', () => {
    expect(sha1('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  test('"abc"', () => {
    expect(sha1('abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  test('"The quick brown fox jumps over the lazy dog"', () => {
    expect(sha1('The quick brown fox jumps over the lazy dog')).toBe('2fd4e1c67a2d28fced849ee1bb76e7391b93eb12');
  });

  test('multi-block message', () => {
    expect(sha1('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '84983e441c3bd26ebaae4aa1f95129e5e54670f1'
    );
  });

  // Domain hash use case — must match output of sha1 npm package v1.1.1
  test('domain hash: "example.com/"', () => {
    expect(sha1('example.com/')).toBe('880970443b82bdca0439e34c62e6c667277c2b39');
    expect(sha1('example.com/').slice(0, 4)).toBe('8809');
  });

  test('domain hash: "localhost/"', () => {
    expect(sha1('localhost/')).toBe('1fffd42e9a20211889ebfae87a84665b392c19a4');
    expect(sha1('localhost/').slice(0, 4)).toBe('1fff');
  });

  test('returns 40-char lowercase hex string', () => {
    expect(sha1('anything')).toMatch(/^[0-9a-f]{40}$/);
  });
});
