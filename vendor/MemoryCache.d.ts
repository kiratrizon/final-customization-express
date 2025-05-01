declare class MemoryCache {
  constructor(expiration?: number);

  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export = MemoryCache;
