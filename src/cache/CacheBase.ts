import Joi from "@hapi/joi";
import { CacheEntityNotFoundError, CacheEntityNotSetError } from "../error";
import { IEntity } from "@lindorm-io/core";
import { Logger } from "@lindorm-io/winston";
import { TRedisClient } from "../typing";

export interface ICache<Entity> {
  create(entity: Entity): Promise<Entity>;
  find(id: string): Promise<Entity>;
  findAll(): Promise<Array<Entity>>;
  remove(entity: Entity): Promise<void>;
}

export interface ICacheOptions {
  client: TRedisClient;
  expiresInSeconds?: number;
  logger: Logger;
}

export interface ICacheBaseOptions extends ICacheOptions {
  entityName: string;
  schema: Joi.Schema;
}

export abstract class CacheBase<Entity extends IEntity> implements ICache<Entity> {
  private client: TRedisClient;
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

  protected abstract getEntityKey(entity: Entity): string;

  async create(entity: Entity): Promise<Entity> {
    const start = Date.now();
    const json = this.getEntityJSON(entity);
    const key = `${this.prefix}::${this.getEntityKey(entity)}`;

    await this.schema.validateAsync(json);
    const result = await this.client.set(key, json, this.expiresInSeconds);
    const success = result === "OK";

    this.logger.debug("set", {
      payload: Object.keys(json),
      result: { success },
      time: Date.now() - start,
    });

    if (!success) {
      throw new CacheEntityNotSetError(key, result);
    }

    return entity;
  }

  async update(entity: Entity): Promise<Entity> {
    await this.find(this.getEntityKey(entity));

    return this.create(entity);
  }

  async find(key: string): Promise<Entity> {
    const start = Date.now();

    const prefixKey = `${this.prefix}::${key}`;
    const result: unknown = await this.client.get(prefixKey);
    const data = result as IEntity;

    this.logger.debug("get", {
      key: prefixKey,
      result: { success: !!result },
      time: Date.now() - start,
    });

    if (!result) {
      throw new CacheEntityNotFoundError(prefixKey, result);
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

    return data;
  }

  async remove(entity: Entity): Promise<void> {
    const start = Date.now();

    const key = this.getEntityKey(entity);
    const prefixKey = `${this.prefix}::${key}`;

    const deletedRows = await this.client.del(prefixKey);

    this.logger.debug("del", {
      key: prefixKey,
      result: { success: !!deletedRows },
      time: Date.now() - start,
    });

    if (deletedRows === 0) {
      throw new CacheEntityNotFoundError(prefixKey, { deletedRows });
    }
  }
}
