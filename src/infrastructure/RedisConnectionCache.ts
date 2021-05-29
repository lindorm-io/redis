import { IRedisConnection, IRedisConnectionOptions } from "../typing";
import { RedisClient } from "../class";
import { RedisConnectionBase } from "./RedisConnectionBase";

export class RedisConnectionCache extends RedisConnectionBase implements IRedisConnection {
  public constructor(options: IRedisConnectionOptions) {
    super(options);
  }

  public async connect(): Promise<void> {
    this._client = new RedisClient(this.clientOptions);
    await this._client.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this._client) return;
    await this._client.quit();
  }
}
