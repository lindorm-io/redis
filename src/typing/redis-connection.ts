import { ClientOpts } from "redis";
import { RedisClient, RedisInMemoryClient } from "../class";
import { RedisConnectionType } from "../enum";

export type TRedisClient = RedisClient | RedisInMemoryClient;

export interface IRedisConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  client(): TRedisClient;
}

export interface IRedisConnectionOptions extends ClientOpts {
  inMemoryCache?: Record<string, any>;
  type: RedisConnectionType;
}
