import { findMediaElement } from '../src/findElem';
import { dataUrlHandler, getDuration, getUriFileExtension } from '../src/helperFunctions';

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

  it('returns "DATA_URL" in event of data uri', () => {
    const test_url = 'data:image/png;base64,iVBORw0KGgoAA5ErkJggg==';
    const output = dataUrlHandler(test_url);
    expect(output).toBe('DATA_URL');
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
