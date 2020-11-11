import Joi from "@hapi/joi";
import MockDate from "mockdate";
import { CacheBase, ICache, ICacheOptions } from "./CacheBase";
import { EntityBase, IEntity, IEntityBaseOptions } from "@lindorm-io/core";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { RedisInMemoryClient } from "../class";

jest.mock("uuid", () => ({
  v4: () => "e397bc49-849e-4df6-a536-7b9fa3574ace",
}));

MockDate.set("2020-01-01 08:00:00.000");

interface IMockEntity extends IEntity {
  name: string;
}

interface IMockEntityOptions extends IEntityBaseOptions {
  name: string;
}

class MockEntity extends EntityBase implements IMockEntity {
  public name: string;

  constructor(options: IMockEntityOptions) {
    super(options);
    this.name = options.name;
  }
}

interface IMockCache extends ICache<MockEntity> {
  set(entity: MockEntity): Promise<MockEntity>;
  get(id: string): Promise<MockEntity>;
  del(entity: MockEntity): Promise<void>;
}

class MockCache extends CacheBase<MockEntity> implements IMockCache {
  constructor(options: ICacheOptions) {
    super({
      ...options,
      entityName: MockEntity.constructor.name,
      schema: Joi.object(),
    });
  }

  protected createEntity(data: IMockEntity): MockEntity {
    return new MockEntity(data);
  }

  protected getEntityJSON(entity: MockEntity): IMockEntity {
    return {
      id: entity.id,
      created: entity.created,
      updated: entity.updated,
      version: entity.version,

      name: entity.name,
    };
  }
}

const logger = new Logger({
  packageName: "n",
  packageVersion: "v",
});
logger.addConsole(LogLevel.ERROR);

describe("CacheBase", () => {
  let client: RedisInMemoryClient;
  let cache: MockCache;
  let entity: MockEntity;

  beforeEach(() => {
    client = new RedisInMemoryClient({
      port: 1,
    });
    cache = new MockCache({
      logger,
      client,
    });
    entity = new MockEntity({
      name: "name",
    });
  });

  test("should set entity", async () => {
    await expect(cache.set(entity)).resolves.toMatchSnapshot();
    expect(client.store[entity.id]).toMatchSnapshot();
  });

  test("should set entity with expiry", async () => {
    cache = new MockCache({
      client,
      expiresInSeconds: 100,
      logger,
    });

    await expect(cache.set(entity)).resolves.toMatchSnapshot();
    expect(client.store[entity.id]).toMatchSnapshot();
  });

  test("should get entity", async () => {
    await cache.set(entity);

    await expect(cache.get(entity.id)).resolves.toMatchSnapshot();
  });

  test("should delete entity", async () => {
    await cache.set(entity);

    await expect(cache.del(entity)).resolves.toBe(undefined);
    expect(client.store[entity.id]).toMatchSnapshot();
  });
});
