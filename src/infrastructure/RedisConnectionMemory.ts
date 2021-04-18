import { IRedisConnection, IRedisConnectionOptions } from "../typing";
import { RedisConnectionBase } from "./RedisConnectionBase";
import { RedisInMemoryClient } from "../class";

export class RedisConnectionMemory extends RedisConnectionBase implements IRedisConnection {
  public _client: RedisInMemoryClient;
  public _inMemoryCache: Record<string, any>;

  constructor(options: IRedisConnectionOptions) {
    super(options);
    this._inMemoryCache = options.inMemoryCache;
  }

  public async connect(): Promise<void> {
    this._client = new RedisInMemoryClient(this._inMemoryCache);
    await this._client.connect();
  }

  public async disconnect(): Promise<void> {
    await this._client.quit();
  }
}
