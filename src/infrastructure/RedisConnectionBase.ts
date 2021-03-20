import { IRedisConnection, IRedisConnectionBaseOptions, TRedisClient } from "../typing";

export abstract class RedisConnectionBase implements IRedisConnection {
  protected client: TRedisClient;
  protected port: number;

  protected constructor(options: IRedisConnectionBaseOptions) {
    this.port = options.port;
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public getClient(): TRedisClient {
    if (!this.client) {
      throw new Error("You must connect() before you can call client()");
    }
    return this.client;
  }
}
