import { CacheEntityNotFoundError, CacheEntityNotSetError } from "../error";
import { ICache } from "../typing";
import { EntityCreationError, IEntity, EntityAttributes } from "@lindorm-io/entity";
import { RedisCache } from "./RedisCache";
import { filter as _filter } from "lodash";

export abstract class CacheBase<Interface extends EntityAttributes, Entity extends IEntity<Interface>>
  extends RedisCache
  implements ICache<Interface, Entity>
{
  protected abstract createEntity(data: Interface): Entity;

  public async create(entity: Entity, expiresInSeconds?: number): Promise<Entity> {
    await entity.schemaValidation();

    const start = Date.now();
    const json = entity.toJSON();
    const key = `${this.prefix}::${entity.getKey()}`;

    try {
      entity.create();
    } catch (err) {
      if (!(err instanceof EntityCreationError)) {
        throw err;
      }
    }

    const result = await this.client.set(key, json, expiresInSeconds || this.expiresInSeconds);
    const success = result === "OK";

    this.logger.debug("create", {
      payload: Object.keys(json),
      result: { success },
      time: Date.now() - start,
    });

    if (!success) {
      throw new CacheEntityNotSetError(key, result);
    }

    return entity;
  }

  public async update(entity: Entity): Promise<Entity> {
    return this.create(entity);
  }

  public async find(key: string): Promise<Entity> {
    const start = Date.now();

    const prefixKey = `${this.prefix}::${key}`;
    const result: unknown = await this.client.get(prefixKey);

    this.logger.debug("find", {
      key: prefixKey,
      result: { success: !!result },
      time: Date.now() - start,
    });

    if (!result) {
      throw new CacheEntityNotFoundError(prefixKey, result);
    }

    return this.createEntity(result as Interface);
  }

  public async findMany(filter: Partial<Interface>): Promise<Array<Entity>> {
    return _filter(await this.findAll(), filter) as Array<Entity>;
  }

  public async findAll(): Promise<Array<Entity>> {
    const start = Date.now();

    const pattern = `${this.prefix}::*`;
    const result = (await this.client.getAll(pattern)) as Array<Interface>;
    const data = [];

    for (const item of Object.values(result)) {
      data.push(this.createEntity(item));
    }

    this.logger.debug("findAll", {
      pattern,
      result: { success: !!result },
      time: Date.now() - start,
    });

    return data;
  }

  public async remove(entity: Entity): Promise<void> {
    const start = Date.now();

    const key = entity.getKey();
    const prefixKey = `${this.prefix}::${key}`;

    const deletedRows = await this.client.del(prefixKey);

    this.logger.debug("remove", {
      key: prefixKey,
      result: { success: !!deletedRows },
      time: Date.now() - start,
    });

    if (deletedRows === 0) {
      throw new CacheEntityNotFoundError(prefixKey, { deletedRows });
    }
  }
}
