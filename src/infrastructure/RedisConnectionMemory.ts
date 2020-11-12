import { RedisConnectionBase } from "./RedisConnectionBase";
import { IRedisConnection, IRedisConnectionBaseOptions } from "../typing";
import { RedisInMemoryClient } from "../class";

export class RedisConnectionMemory extends RedisConnectionBase implements IRedisConnection {
  protected client: RedisInMemoryClient;

  constructor(options: IRedisConnectionBaseOptions) {
    super(options);
  }

  public async connect(): Promise<void> {
    this.client = new RedisInMemoryClient({ port: this.port });
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
