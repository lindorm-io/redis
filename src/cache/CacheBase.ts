import Joi from "@hapi/joi";
import { IEntity } from "@lindorm-io/core";
import { Logger } from "@lindorm-io/winston";
import { RedisClient, RedisInMemoryClient } from "../class";

export interface ICache<Entity> {
  create(entity: Entity): Promise<Entity>;
  find(id: string): Promise<Entity>;
  findAll(): Promise<Array<Entity>>;
  remove(entity: Entity): Promise<void>;
}

export interface ICacheOptions {
  expiresInSeconds?: number;
  logger: Logger;
  client: RedisClient | RedisInMemoryClient;
}

export interface ICacheBaseOptions extends ICacheOptions {
  entityName: string;
  schema: Joi.Schema;
}

export abstract class CacheBase<Entity extends IEntity> implements ICache<Entity> {
  private client: RedisClient | RedisInMemoryClient;
  private expiresInSeconds: number;
  private prefix: string;
  private schema: Joi.Schema;
  protected logger: Logger;

  protected constructor(options: ICacheBaseOptions) {
    this.client = options.client;
    this.expiresInSeconds = options.expiresInSeconds || null;
    this.prefix = options.entityName;
    this.schema = options.schema;

    this.logger = options.logger.createChildLogger(["redis", "cache", options.entityName]);
  }

  protected abstract createEntity(data: IEntity): Entity;

  protected abstract getEntityJSON(entity: Entity): IEntity;

  async create(entity: Entity): Promise<Entity> {
    const start = Date.now();
    const json = this.getEntityJSON(entity);
    const key = `${this.prefix}::${json.id}`;

    await this.schema.validateAsync(json);
    await this.client.set(key, json, this.expiresInSeconds);

    this.logger.debug("set", {
      payload: Object.keys(json),
      time: Date.now() - start,
    });

    return entity;
  }

  async find(id: string): Promise<Entity> {
    const start = Date.now();

    const key = `${this.prefix}::${id}`;
    const result: unknown = await this.client.get(key);
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

  async findAll(): Promise<Array<Entity>> {
    const start = Date.now();

    const pattern = `${this.prefix}::*`;
    const result: any = await this.client.getAll(pattern);
    const data: Array<Entity> = [];

    for (const object of Object.values(result)) {
      data.push(this.createEntity(object as IEntity));
    }

    this.logger.debug("getAll", {
      pattern,
      result: { success: !!result },
      time: Date.now() - start,
    });

    if (!result) {
      throw new Error("Not found");
    }

    return data;
  }

  async remove(entity: Entity): Promise<void> {
    const start = Date.now();

    const { id } = this.getEntityJSON(entity);
    const key = `${this.prefix}::${id}`;

    await this.client.del(key);

    this.logger.debug("del", {
      filter: Object.keys({ id }),
      result: { success: true },
      time: Date.now() - start,
    });
  }
}
