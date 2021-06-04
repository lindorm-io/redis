import { IRedisConnection, RedisConnectionOptions } from "../typing";
import { RedisConnectionBase } from "./RedisConnectionBase";
import { RedisClient, RedisInMemoryClient } from "../class";

export class RedisConnectionMemory extends RedisConnectionBase implements IRedisConnection {
  public readonly inMemoryCache: Record<string, any>;

  public constructor(options: RedisConnectionOptions) {
    super(options);
    this.inMemoryCache = options.inMemoryCache || {};
  }

  public async connect(): Promise<void> {
    this._client = new RedisInMemoryClient(this.inMemoryCache) as unknown as RedisClient;
    await this._client.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this._client) return;
    await this._client.quit();
  }
}
