import {
  VimeoEventType,
  InternalVimeoEvent,
  CapturableInternalVimeoEvents,
  AvailableMediaEventType,
} from '../src/events';
import { filterVimeoEvents } from '../src/utils';
import { InternalVimeoTrackingConfiguration } from '../src/types';

describe('Vimeo Tracking', () => {
  describe('captureEvents', () => {
    // The video element is irrelevant for this test, but a required parameter
    const video = document.createElement('iframe');
    const alwaysOnEvents = [InternalVimeoEvent.TIMEUPDATE, InternalVimeoEvent.PROGRESS];

    const defaultConfiguration: InternalVimeoTrackingConfiguration = {
      video,
      id: 'test',
      captureEvents: Object.values(AvailableMediaEventType),
      vimeoCaptureEvents: [...CapturableInternalVimeoEvents, ...alwaysOnEvents],
    };

    it('assigns defaults if no captureEvents passed', () => {
      const trackingOptions = filterVimeoEvents({ video, id: 'test' });
      expect(trackingOptions.captureEvents).toEqual(defaultConfiguration.captureEvents);
      trackingOptions.vimeoCaptureEvents?.forEach((event) => {
        expect(trackingOptions.vimeoCaptureEvents).toContain(event);
      });
    });

    it("doesn't assign default if empty array is passed", () => {
      const trackingOptions = filterVimeoEvents({ video, id: 'test', captureEvents: [] });
      expect(trackingOptions).toEqual({
        ...defaultConfiguration,
        captureEvents: [],
        vimeoCaptureEvents: alwaysOnEvents,
      });
    });

    it('assigns to captureEvents and vimeoCaptureEvents if valid events passed', () => {
      const trackingOptions = filterVimeoEvents({
        video,
        id: 'test',
        captureEvents: [AvailableMediaEventType.Play, VimeoEventType.TextTrackChange],
      });

      expect(trackingOptions).toEqual({
        ...defaultConfiguration,
        captureEvents: [AvailableMediaEventType.Play],
        vimeoCaptureEvents: expect.arrayContaining([InternalVimeoEvent.TEXTTRACKCHANGE, ...alwaysOnEvents]),
      });
    });
  });
});
