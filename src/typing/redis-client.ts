export type TPromise<T> = (...args: any) => Promise<T>;

export interface IRedisClient {
  connect(): Promise<void>;
  quit(): Promise<string | undefined>;
  set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string | unknown>;
  get(key: string): Promise<Record<string, any> | undefined>;
  getAll(pattern: string): Promise<Array<Record<string, any>>>;
  del(key: string): Promise<number>;
}
