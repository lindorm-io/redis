import { RedisConnectionType } from "../enum";
import { RedisClient, RedisInMemoryClient } from "../class";

export type TPromise<T> = (...args: any) => Promise<T>;

export type TRedisClient = RedisClient | RedisInMemoryClient;

export interface IRedisClient {
  connect: () => Promise<void>;
  quit: () => Promise<string>;
  set: (key: string, value: Record<string, any>, expiresInSeconds?: number) => Promise<string>;
  get: (key: string) => Promise<Record<string, any>>;
  getAll: (pattern: string) => Promise<Array<Record<string, any>>>;
  del: (key: string) => Promise<number>;
}

export interface IRedisClientOptions {
  port: number;
}

export interface IRedisConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => TRedisClient;
}

export interface IRedisConnectionBaseOptions {
  port: number;
  inMemoryCache?: Record<string, any>;
}

export interface IRedisConnectionOptions extends IRedisConnectionBaseOptions {
  type: RedisConnectionType;
}
