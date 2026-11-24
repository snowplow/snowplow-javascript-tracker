export type BotKind =
  | 'awesomium'
  | 'cef'
  | 'cefsharp'
  | 'coachjs'
  | 'electron'
  | 'fminer'
  | 'geb'
  | 'nightmarejs'
  | 'phantomas'
  | 'phantomjs'
  | 'rhino'
  | 'selenium'
  | 'sequentum'
  | 'slimerjs'
  | 'webdriverio'
  | 'webdriver'
  | 'headless_chrome'
  | 'unknown';

export interface BotDetectionContextData {
  [key: string]: unknown;
  bot: boolean;
  kind: BotKind | null;
}
