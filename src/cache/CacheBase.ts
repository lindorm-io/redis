import { LindormCacheOptions } from "../typing";
import { Logger } from "@lindorm-io/winston";
import { RedisClient } from "../class";

export abstract class CacheBase {
  protected client: RedisClient;
  protected expiresInSeconds: number | undefined;
  protected logger: Logger;
  protected prefix: string;

  protected constructor(options: LindormCacheOptions) {
    this.client = options.client;
    this.expiresInSeconds = options.expiresInSeconds || undefined;
    this.logger = options.logger.createChildLogger(["CacheBase", options.entityName]);
    this.prefix = options.entityName;
  }
}
