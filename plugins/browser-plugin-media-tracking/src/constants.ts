export enum SEARCH_ERROR {
  NOT_FOUND = 'Media element not found',
  MULTIPLE_ELEMENTS = 'More than one media element in the provided node',
  PLYR_CURRENTSRC = 'Plyr currentSrc not updated',
}
export const READY_STATE: Record<number, string> = {
  0: 'HAVE_NOTHING',
  1: 'HAVE_METADATA',
  2: 'HAVE_CURRENT_DATA',
  3: 'HAVE_FUTURE_DATA',
  4: 'HAVE_ENOUGH_DATA',
};

export const NETWORK_STATE: Record<number, string> = {
  0: 'NETWORK_EMPTY',
  1: 'NETWORK_IDLE',
  2: 'NETWORK_LOADING',
  3: 'NETWORK_NO_SOURCE',
};
