import { findMediaElement } from '../src/findElem';
import { dataUrlHandler, getDuration, getUriFileExtension } from '../src/helperFunctions';
import { buildHTMLMediaElementEntity } from '../src/entities';

describe('element searcher', () => {
  it('finds a video with id', () => {
    document.body.innerHTML = '<div><video id="videoElem" src="test.mp4"</video></div>';
    const output = findMediaElement('videoElem');
    expect(output.el);
    expect(output.el?.tagName).toBe('VIDEO');
    expect(output.el?.id).toBe('videoElem');
  });

  it("returns error if the element doesn't have the id", () => {
    document.body.innerHTML = '<div><video src="test.mp4"</video></div>';
    const output = findMediaElement('videoElem');
    expect(output).toStrictEqual({ err: 'Media element not found' });
  });

  it('finds a child video element in parent with id', () => {
    document.body.innerHTML = '<div id="parentElem"><video></video></div>';
    debugger;
    const output = findMediaElement('parentElem');
    expect(output.el?.tagName).toBe('VIDEO');
  });

  it('returns an error if multiple child audio elements exist in a parent', () => {
    document.body.innerHTML = '<div id="parentElem"><audio></audio><audio></audio></div>';
    const output = findMediaElement('parentElem');
    expect(output).toStrictEqual({ err: 'More than one media element in the provided node' });
  });

  it('returns the first video element if exactly two exist in the same parent. Covers the cover-video case.', () => {
    document.body.innerHTML = '<div id="parentElem"><video id="test-id"></video><video></video></div>';
    const output = findMediaElement('parentElem');
    expect(output.el?.tagName).toBe('VIDEO');
    expect(output.el?.id).toBe('test-id');
  });

  it('returns an error if multiple child video elements exist in a parent', () => {
    document.body.innerHTML = '<div id="parentElem"><video></video><video></video><video></video></div>';
    const output = findMediaElement('parentElem');
    expect(output).toStrictEqual({ err: 'More than one media element in the provided node' });
  });

  it('falls back to css selector if can not find by id', () => {
    document.body.innerHTML = '<div id="parentElem"><video></video><video></video><video></video></div>';
    const output = findMediaElement('#parentElem > video');
    expect(output.el?.tagName).toBe('VIDEO');
  });
});

describe('dataUrlHandler', () => {
  it('returns a non-data uri', () => {
    const test_url = 'http://example.com/example.mp4';
    const output = dataUrlHandler(test_url);
    expect(output).toBe(test_url);
  });

  // The placeholder replaces a potentially very large data URI, but has to stay a
  // valid URI itself: the schema constrains this field with `format: uri`.
  it('returns a valid uri placeholder in event of data uri', () => {
    const test_url = 'data:image/png;base64,iVBORw0KGgoAA5ErkJggg==';
    const output = dataUrlHandler(test_url);
    expect(output).toBe('data:');
  });

  it('matches the data: scheme case-insensitively', () => {
    // URI schemes are case-insensitive per RFC 3986, so this is a real data URI and
    // its payload must not be sent.
    const test_url = 'DATA:image/png;base64,iVBORw0KGgoAA5ErkJggg==';
    const output = dataUrlHandler(test_url);
    expect(output).toBe('data:');
  });

  it('keeps urls that merely contain data: outside the scheme', () => {
    // 'data:' has to be matched as a scheme, not as a substring, or valid URLs get
    // replaced by the placeholder.
    for (const test_url of [
      'https://example.com/metadata:9/video.mp4',
      'https://example.com/data:foo/video.mp4',
      'https://example.com/video.mp4?ref=data:x',
    ]) {
      expect(dataUrlHandler(test_url)).toBe(test_url);
    }
  });
});

describe('getUriFileExtension', () => {
  it('parses simple URLs', () => {
    const test_url = 'http://example.com/example.mp4';
    const output = getUriFileExtension(test_url);
    expect(output).toBe('mp4');
  });

  it('ignores uri cruft', () => {
    let test_url = 'http://example.com/example.wmv?abc=123';
    let output = getUriFileExtension(test_url);
    expect(output).toBe('wmv');

    test_url = 'http://example.com/example.avi#fragment';
    output = getUriFileExtension(test_url);
    expect(output).toBe('avi');
  });

  it('prefers the uri pathname', () => {
    // there is ambiguity here, taking only from the path if possible
    const test_url = 'http://example.com/example.mp4?token=123.abc';
    const output = getUriFileExtension(test_url);
    expect(output).toBe('mp4');
  });

  it('falls back to rest of uri', () => {
    const test_url = 'http://example.com/media?file=test.mov';
    const output = getUriFileExtension(test_url);
    expect(output).toBe('mov');
  });

  it('ignores data uris', () => {
    /*
    schema description is "The media file format", so could make an argument
    for pulling the MIME type here, but the name fileExtension implies this
    should be derived from the name, which we do not have for data URIs
    */
    const test_url = 'data:image/png;base64,iVBORw0KGgoAA5ErkJggg==';
    const output = getUriFileExtension(test_url);
    expect(output).toBe(null);
  });
});

describe('getDuration of a ', () => {
  describe('video element', () => {
    it('returns the duration if valid', () => {
      const video = { duration: 10 } as HTMLVideoElement;
      const output = getDuration(video);
      expect(output).toBe(10);
    });

    it('returns null if the duration is Infinity', () => {
      const video = { duration: Infinity } as HTMLVideoElement;
      const output = getDuration(video);
      expect(output).toBe(null);
    });

    it('returns null if the duration is +Infinity', () => {
      const video = { duration: +Infinity } as HTMLVideoElement;
      const output = getDuration(video);
      expect(output).toBe(null);
    });

    it('returns null if the duration is NaN', () => {
      const video = { duration: NaN } as HTMLVideoElement;
      const output = getDuration(video);
      expect(output).toBe(null);
    });

    it('returns null if the duration is not available', () => {
      const video = {} as HTMLVideoElement;
      const output = getDuration(video);
      expect(output).toBe(null);
    });
  });

  describe('audio element', () => {
    it('returns the duration if valid', () => {
      const audio = { duration: 10 } as HTMLAudioElement;
      const output = getDuration(audio);
      expect(output).toBe(10);
    });

    it('returns null if the duration is Infinity', () => {
      const audio = { duration: Infinity } as HTMLAudioElement;
      const output = getDuration(audio);
      expect(output).toBe(null);
    });

    it('returns null if the duration is +Infinity', () => {
      const audio = { duration: +Infinity } as HTMLAudioElement;
      const output = getDuration(audio);
      expect(output).toBe(null);
    });

    it('returns null if the duration is NaN', () => {
      const audio = { duration: NaN } as HTMLAudioElement;
      const output = getDuration(audio);
      expect(output).toBe(null);
    });

    it('returns null if the duration is not available', () => {
      const audio = {} as HTMLAudioElement;
      const output = getDuration(audio);
      expect(output).toBe(null);
    });
  });
});

describe('buildHTMLMediaElementEntity', () => {
  const setSource = (el: HTMLMediaElement, { currentSrc = '', src = '' }) => {
    // currentSrc is read-only in the DOM, so define it directly. src is set via the
    // property so JSDOM resolves it the same way a browser would.
    Object.defineProperty(el, 'currentSrc', { value: currentSrc, configurable: true });
    if (src) el.src = src;
  };

  it('omits the entity while no source is attached', () => {
    // Both currentSrc and src are empty between element creation and MediaSource
    // attachment in MSE players. currentSrc is required and constrained to
    // `format: uri`, which an empty string does not satisfy.
    const video = document.createElement('video');
    setSource(video, { currentSrc: '', src: '' });

    expect(buildHTMLMediaElementEntity(video)).toBeNull();
  });

  it('builds the entity once a source attaches', () => {
    const video = document.createElement('video');
    setSource(video, { currentSrc: 'https://example.com/video.m3u8' });

    const entity = buildHTMLMediaElementEntity(video);

    expect(entity).not.toBeNull();
    expect(entity!.schema).toBe('iglu:org.whatwg/media_element/jsonschema/1-0-0');
    expect(entity!.data).toMatchObject({ currentSrc: 'https://example.com/video.m3u8' });
  });

  it('builds the entity for a blob: source', () => {
    // blob: URLs are what MSE players attach, and are valid absolute URIs.
    const video = document.createElement('video');
    setSource(video, { currentSrc: 'blob:https://example.com/9d7f-4c1a' });

    const entity = buildHTMLMediaElementEntity(video);

    expect(entity!.data).toMatchObject({ currentSrc: 'blob:https://example.com/9d7f-4c1a' });
  });

  it('falls back to src when currentSrc is empty', () => {
    const video = document.createElement('video');
    setSource(video, { currentSrc: '', src: 'https://example.com/fallback.mp4' });

    const entity = buildHTMLMediaElementEntity(video);

    expect(entity!.data).toMatchObject({ currentSrc: 'https://example.com/fallback.mp4' });
  });

  it('never serializes src as an empty string', () => {
    // src has no attribute set, so it falls back to currentSrc rather than ''.
    const video = document.createElement('video');
    setSource(video, { currentSrc: 'blob:https://example.com/9d7f-4c1a' });

    const entity = buildHTMLMediaElementEntity(video);

    expect(entity!.data).toMatchObject({ src: 'blob:https://example.com/9d7f-4c1a' });
  });
});
