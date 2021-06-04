import { IRedisConnection, RedisConnectionOptions } from "../typing";
import { RedisConnectionBase } from "./RedisConnectionBase";
import { RedisConnectionCache } from "./RedisConnectionCache";
import { RedisConnectionMemory } from "./RedisConnectionMemory";
import { RedisConnectionType } from "../enum";
import { RedisClient } from "../class";

export class RedisConnection implements IRedisConnection {
  private connection: RedisConnectionBase;

  public constructor(options: RedisConnectionOptions) {
    switch (options.type) {
      case RedisConnectionType.CACHE:
        this.connection = new RedisConnectionCache(options);
        break;

      case RedisConnectionType.MEMORY:
        this.connection = new RedisConnectionMemory(options);
        break;

      default:
        throw new Error(`Unknown connection type: [ ${options.type} ]`);
    }
  }

  public async connect(): Promise<void> {
    return this.connection.connect();
  }

  public async disconnect(): Promise<void> {
    return this.connection.disconnect();
  }

  public isConnected(): boolean {
    return this.connection.isConnected();
  }

  public client(): RedisClient {
    return this.connection.client();
  }
}
