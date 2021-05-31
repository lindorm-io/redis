import { TRedisClient } from "./index";
import { Logger } from "@lindorm-io/winston";

export interface ICache<Interface, Entity> {
  create(entity: Entity, expiresInSeconds?: number): Promise<Entity>;
  update(entity: Entity): Promise<Entity>;
  find(id: string): Promise<Entity>;
  findAll(): Promise<Array<Entity>>;
  findMany(filter: Partial<Interface>): Promise<Array<Entity>>;
  remove(entity: Entity): Promise<void>;
}

export interface ICacheOptions {
  client: TRedisClient;
  expiresInSeconds?: number;
  logger: Logger;
}

export interface ICacheBaseOptions extends ICacheOptions {
  entityName: string;
}
