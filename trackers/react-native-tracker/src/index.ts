if (typeof crypto === 'undefined') {
  throw new Error('Web Crypto is not available. Please use a polyfill like react-native-get-random-values');
}

export * from './types';
export * from './tracker';
