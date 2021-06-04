import { CacheBaseOptions } from "../typing";
import { Logger } from "@lindorm-io/winston";
import { RedisClient } from "../class";

export abstract class RedisCache {
  protected client: RedisClient;
  protected expiresInSeconds: number | undefined;
  protected logger: Logger;
  protected prefix: string;

  protected constructor(options: CacheBaseOptions) {
    this.client = options.client;
    this.expiresInSeconds = options.expiresInSeconds || undefined;
    this.logger = options.logger.createChildLogger(["RedisCache", options.entityName]);
    this.prefix = options.entityName;
  }
}
