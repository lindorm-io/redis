import { TObject } from "@lindorm-io/core";
import { RedisConnectionType } from "../enum";
import { RedisClient, RedisInMemoryClient } from "../class";

export type TRedisClient = RedisClient | RedisInMemoryClient;

export interface IRedisClient {
  connect: () => Promise<void>;
  quit: () => Promise<string>;
  set: (key: string, value: TObject<any>, expiresInSeconds?: number) => Promise<string>;
  get: (key: string) => Promise<TObject<any>>;
  getAll: (pattern: string) => Promise<Array<TObject<any>>>;
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
  inMemoryCache?: TObject<any>;
}

export interface IRedisConnectionOptions extends IRedisConnectionBaseOptions {
  type: RedisConnectionType;
}
