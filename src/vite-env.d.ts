interface Window {
  storage?: {
    get: (key: string, sync?: boolean) => Promise<{ value: string } | null>;
    set: (key: string, value: string, sync?: boolean) => Promise<void>;
    list: (prefix: string, sync?: boolean) => Promise<{ keys: string[] } | null>;
  };
}
