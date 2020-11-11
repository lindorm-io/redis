import Joi from "@hapi/joi";
import { IEntity } from "@lindorm-io/core";
import { Logger } from "@lindorm-io/winston";
import { RedisClient } from "../class/RedisClient";

export interface ICache<Entity> {
  set(entity: Entity): Promise<Entity>;
  get(id: string): Promise<Entity>;
  del(entity: Entity): Promise<void>;
}

export interface ICacheOptions {
  expiresInSeconds?: number;
  logger: Logger;
  port: number;
}

export interface ICacheBaseOptions extends ICacheOptions {
  entityName: string;
  schema: Joi.Schema;
}

export abstract class CacheBase<Entity extends IEntity> implements ICache<Entity> {
  private client: RedisClient;
  private schema: Joi.Schema;
  private expiresInSeconds: number;
  protected logger: Logger;

  protected constructor(options: ICacheBaseOptions) {
    this.client = new RedisClient({ port: options.port });
    this.schema = options.schema;
    this.expiresInSeconds = options.expiresInSeconds || null;
    this.logger = options.logger.createChildLogger(["redis", options.entityName]);
  }

  protected abstract createEntity(data: IEntity): Entity;

  protected abstract getEntityJSON(entity: Entity): IEntity;

  async set(entity: Entity): Promise<Entity> {
    const start = Date.now();
    const json = this.getEntityJSON(entity);

    await this.schema.validateAsync(json);
    await this.client.set(json.id, json, this.expiresInSeconds);

    this.logger.debug("set", {
      payload: Object.keys(json),
      time: Date.now() - start,
    });

    return entity;
  }

  async get(id: string): Promise<Entity> {
    const start = Date.now();

    const result: unknown = await this.client.get(id);
    const data = result as IEntity;

    this.logger.debug("get", {
      id,
      result: { success: !!result },
      time: Date.now() - start,
    });

    if (!result) {
      throw new Error("Not found");
    }

    return this.createEntity(data);
  }

  async del(entity: Entity): Promise<void> {
    const start = Date.now();

    const { id } = this.getEntityJSON(entity);

    await this.client.del(id);

    this.logger.debug("del", {
      filter: Object.keys({ id }),
      result: { success: true },
      time: Date.now() - start,
    });
  }
}
