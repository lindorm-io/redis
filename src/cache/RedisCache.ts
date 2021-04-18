import Joi from "@hapi/joi";
import { ICacheBaseOptions, TRedisClient } from "../typing";
import { Logger } from "@lindorm-io/winston";

export abstract class RedisCache {
  protected client: TRedisClient;
  protected expiresInSeconds: number;
  protected logger: Logger;
  protected prefix: string;
  protected schema: Joi.Schema;

  protected constructor(options: ICacheBaseOptions) {
    this.client = options.client;
    this.expiresInSeconds = options.expiresInSeconds || null;
    this.logger = options.logger.createChildLogger(["RedisCache", options.entityName]);
    this.prefix = options.entityName;
    this.schema = options.schema;
  }
}
