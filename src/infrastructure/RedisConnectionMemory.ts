import { IRedisConnection, IRedisConnectionBaseOptions } from "../typing";
import { RedisConnectionBase } from "./RedisConnectionBase";
import { RedisInMemoryClient } from "../class";

export class RedisConnectionMemory extends RedisConnectionBase implements IRedisConnection {
  public client: RedisInMemoryClient;
  public inMemoryCache: Record<string, any>;

  constructor(options: IRedisConnectionBaseOptions) {
    super(options);
    this.inMemoryCache = options.inMemoryCache;
  }

  public async connect(): Promise<void> {
    this.client = new RedisInMemoryClient(this.inMemoryCache);
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
