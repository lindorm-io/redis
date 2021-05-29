import { ClientOpts } from "redis";
import { IRedisConnection, IRedisConnectionOptions, TRedisClient } from "../typing";

export abstract class RedisConnectionBase implements IRedisConnection {
  protected readonly clientOptions: ClientOpts;
  protected _client: TRedisClient | undefined;

  protected constructor(options: IRedisConnectionOptions) {
    const { inMemoryCache, type, ...clientOptions } = options;

    this.clientOptions = clientOptions;
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public client(): TRedisClient {
    if (!this._client) {
      throw new Error("Client could not be found. Call connect() first.");
    }
    return this._client;
  }
}
