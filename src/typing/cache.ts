import { TRedisClient } from "./index";
import { Logger } from "@lindorm-io/winston";
import Joi from "@hapi/joi";

export interface ICache<Entity> {
  create(entity: Entity): Promise<Entity>;
  update(entity: Entity): Promise<Entity>;
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
