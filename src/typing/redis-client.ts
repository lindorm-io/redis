export type TPromise<T> = (...args: any) => Promise<T>;

export interface IRedisClient {
  connect(): Promise<void>;
  quit(): Promise<string>;
  set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string>;
  get(key: string): Promise<Record<string, any>>;
  getAll(pattern: string): Promise<Array<Record<string, any>>>;
  del(key: string): Promise<number>;
}
