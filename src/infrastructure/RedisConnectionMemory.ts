import { IRedisConnection, IRedisConnectionOptions } from "../typing";
import { RedisConnectionBase } from "./RedisConnectionBase";
import { RedisInMemoryClient } from "../class";

export class RedisConnectionMemory extends RedisConnectionBase implements IRedisConnection {
  public readonly inMemoryCache: Record<string, any>;

  public constructor(options: IRedisConnectionOptions) {
    super(options);
    this.inMemoryCache = options.inMemoryCache || {};
  }

  public async connect(): Promise<void> {
    this._client = new RedisInMemoryClient(this.inMemoryCache);
    await this._client.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this._client) return;
    await this._client.quit();
  }
}
