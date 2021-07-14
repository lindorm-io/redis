import { Logger } from "@lindorm-io/winston";
import { RedisClient } from "../class";

export interface ILindormCache<Interface, Entity> {
  create(entity: Entity, expiresInSeconds?: number): Promise<Entity>;
  createMany(entities: Array<Entity>, expiresInSeconds?: number): Promise<Array<Entity>>;
  update(entity: Entity, expiresInSeconds?: number): Promise<Entity>;
  updateMany(entities: Array<Entity>, expiresInSeconds?: number): Promise<Array<Entity>>;
  find(id: string): Promise<Entity>;
  findAll(): Promise<Array<Entity>>;
  findMany(filter: Partial<Interface>): Promise<Array<Entity>>;
  remove(entity: Entity): Promise<void>;
}

export interface CacheOptions {
  client: RedisClient;
  expiresInSeconds?: number;
  logger: Logger;
}

export interface LindormCacheOptions extends CacheOptions {
  entityName: string;
}
