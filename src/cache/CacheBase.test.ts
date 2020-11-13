import Joi from "@hapi/joi";
import MockDate from "mockdate";
import { CacheBase, ICache, ICacheOptions } from "./CacheBase";
import { EntityBase, IEntity, IEntityBaseOptions, TObject } from "@lindorm-io/core";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { RedisConnection } from "../infrastructure";
import { RedisConnectionType } from "../enum";
import { TRedisClient } from "../typing";

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
  create(entity: MockEntity): Promise<MockEntity>;
  find(id: string): Promise<MockEntity>;
  remove(entity: MockEntity): Promise<void>;
}

class MockCache extends CacheBase<MockEntity> implements IMockCache {
  constructor(options: ICacheOptions) {
    super({
      ...options,
      entityName: "mock",
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

  protected getEntityKey(entity: MockEntity): string {
    return entity.id;
  }
}

const logger = new Logger({
  packageName: "n",
  packageVersion: "v",
});
logger.addConsole(LogLevel.ERROR);

describe("CacheBase", () => {
  let inMemoryCache: TObject<any>;
  let redis: RedisConnection;
  let client: TRedisClient;
  let cache: MockCache;
  let entity: MockEntity;

  beforeEach(async () => {
    inMemoryCache = {};

    redis = new RedisConnection({
      type: RedisConnectionType.MEMORY,
      port: 1,
      inMemoryCache,
    });

    await redis.connect();
    client = redis.getClient();

    cache = new MockCache({
      logger,
      client,
    });
    entity = new MockEntity({
      name: "name",
    });
  });

  afterEach(async () => {
    await client.quit();
    jest.clearAllMocks();
  });

  test("should create entity", async () => {
    await expect(cache.create(entity)).resolves.toMatchSnapshot();

    expect(inMemoryCache).toMatchSnapshot();
  });

  test("should create entity with expiry", async () => {
    cache = new MockCache({
      client,
      expiresInSeconds: 100,
      logger,
    });

    await expect(cache.create(entity)).resolves.toMatchSnapshot();

    expect(inMemoryCache).toMatchSnapshot();
  });

  test("should find entity", async () => {
    await cache.create(entity);

    await expect(cache.find(entity.id)).resolves.toMatchSnapshot();
  });

  test("should find all entities", async () => {
    await cache.create(
      new MockEntity({
        id: "e397bc49-849e-4df6-a536-7b9fa3574ace",
        name: "one",
      }),
    );
    await cache.create(
      new MockEntity({
        id: "fa354ace-4df6-849e-a536-e397b7c497b9",
        name: "two",
      }),
    );

    await expect(cache.findAll()).resolves.toMatchSnapshot();
  });

  test("should remove entity", async () => {
    await cache.create(entity);

    await expect(cache.remove(entity)).resolves.toBe(undefined);

    expect(inMemoryCache).toMatchSnapshot();
  });
});
