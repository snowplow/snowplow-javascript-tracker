export interface UACookies {
  __utma?: string;
  __utmb?: string;
  __utmc?: string;
  __utmv?: string;
  __utmz?: string;
  _ga?: string;
  [key: string]: string | undefined;
}

export interface GA4Cookies {
  _ga?: string;
  session_cookies?: GA4SessionCookies[];
  [key: string]: unknown;
}

export interface GA4SessionCookies {
  measurement_id: string;
  session_cookie?: string;
}
