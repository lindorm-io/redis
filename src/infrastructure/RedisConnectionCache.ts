import { RedisConnectionBase } from "./RedisConnectionBase";
import { IRedisConnection, IRedisConnectionBaseOptions } from "../typing";
import { RedisClient } from "../class";

export class RedisConnectionCache extends RedisConnectionBase implements IRedisConnection {
  protected client: RedisClient;

  constructor(options: IRedisConnectionBaseOptions) {
    super(options);
  }

  public async connect(): Promise<void> {
    this.client = new RedisClient({ port: this.port });
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
