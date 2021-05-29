import { ICacheBaseOptions, TRedisClient } from "../typing";
import { Logger } from "@lindorm-io/winston";

export abstract class RedisCache {
  protected client: TRedisClient;
  protected expiresInSeconds: number | undefined;
  protected logger: Logger;
  protected prefix: string;

  protected constructor(options: ICacheBaseOptions) {
    this.client = options.client;
    this.expiresInSeconds = options.expiresInSeconds || undefined;
    this.logger = options.logger.createChildLogger(["RedisCache", options.entityName]);
    this.prefix = options.entityName;
  }
}
