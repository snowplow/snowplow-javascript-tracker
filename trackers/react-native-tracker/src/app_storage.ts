export type AppStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

let appStorage: AppStorage | undefined;

export function setAppStorage(storage: AppStorage) {
  appStorage = storage;
}

export function getAppStorage() {
  if (!appStorage) {
    throw new Error('Snowplow storage is not set');
  }

  return appStorage;
}
