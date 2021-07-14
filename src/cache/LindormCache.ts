import { CacheBase } from "./CacheBase";
import { CacheError, EntityNotFoundError } from "../error";
import { EntityCreationError, ILindormEntity, EntityAttributes } from "@lindorm-io/entity";
import { ILindormCache } from "../typing";
import { filter as _filter } from "lodash";

export abstract class LindormCache<Interface extends EntityAttributes, Entity extends ILindormEntity<Interface>>
  extends CacheBase
  implements ILindormCache<Interface, Entity>
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
      payload: json,
      result: { success },
      time: Date.now() - start,
    });

    if (!success) {
      throw new CacheError("Unable to set entity in cache", {
        debug: { key, json, result },
      });
    }

    return entity;
  }

  public async update(entity: Entity, expiresInSeconds?: number): Promise<Entity> {
    await entity.schemaValidation();

    const start = Date.now();
    const json = entity.toJSON();
    const key = `${this.prefix}::${entity.getKey()}`;

    const result = await this.client.set(key, json, expiresInSeconds);
    const success = result === "OK";

    this.logger.debug("update", {
      payload: json,
      result: { success },
      time: Date.now() - start,
    });

    if (!success) {
      throw new CacheError("Unable to set entity in cache", {
        debug: { key, json, result },
      });
    }

    return entity;
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
      throw new EntityNotFoundError("Unable to find entity in cache", {
        debug: { prefixKey, result },
      });
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
      throw new CacheError("Unable to delete entity from cache", {
        debug: { prefixKey, deletedRows },
      });
    }
  }
}
