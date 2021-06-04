import { ClientOpts } from "redis";
import { RedisClient } from "../class";
import { IRedisConnection, RedisConnectionOptions } from "../typing";

export abstract class RedisConnectionBase implements IRedisConnection {
  protected readonly clientOptions: ClientOpts;
  protected _client: RedisClient | undefined;

  protected constructor(options: RedisConnectionOptions) {
    const { inMemoryCache, type, ...clientOptions } = options;

    this.clientOptions = clientOptions;
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public isConnected(): boolean {
    if (!this._client) {
      return false;
    }
    return this._client.isConnected();
  }

  public client(): RedisClient {
    if (!this._client) {
      throw new Error("Client could not be found. Call connect() first.");
    }
    return this._client;
  }
}
