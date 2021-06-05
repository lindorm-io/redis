import { ClientOpts } from "redis";
import { RedisClient, RedisInMemoryClient } from "../class";
import { RedisConnectionType } from "../enum";

export interface IRedisConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  client(): RedisClient | RedisInMemoryClient;
}

export interface RedisConnectionOptions extends ClientOpts {
  inMemoryCache?: Record<string, any>;
  type?: RedisConnectionType;
}
