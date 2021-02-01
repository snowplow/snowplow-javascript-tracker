/**
 * Schema for a context of Google Analytics cookie values
 */
export interface Cookies {
  __utma?: string;
  __utmb?: string;
  __utmc?: string;
  __utmv?: string;
  __utmz?: string;
  _ga?: string;
  [key: string]: string | undefined;
}
