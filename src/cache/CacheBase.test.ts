import Joi from "@hapi/joi";
import MockDate from "mockdate";
import { CacheBase, ICache, ICacheOptions } from "./CacheBase";
import { EntityBase, IEntity, IEntityBaseOptions } from "@lindorm-io/core";
import { Logger, LogLevel } from "@lindorm-io/winston";

jest.mock("uuid", () => ({
  v4: () => "e397bc49-849e-4df6-a536-7b9fa3574ace",
}));

MockDate.set("2020-01-01 08:00:00.000");
const date = new Date("2020-01-01 08:00:00.000");

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

const mockSet = jest.fn((...args: any) => undefined);
const mockGet = jest.fn((...args: any) => ({
  id: "id",
  created: "created",
  updated: "updated",
  version: "version",
  name: "name",
}));
const mockDel = jest.fn((...args: any) => undefined);

jest.mock("../class/RedisClient", () => ({
  RedisClient: class RedisClient {
    set(...args: any): any {
      mockSet(...args);
    }

    get(...args: any): any {
      return mockGet(...args);
    }

    del(...args: any): any {
      mockDel(...args);
    }
  },
}));

const logger = new Logger({
  packageName: "n",
  packageVersion: "v",
});
logger.addConsole(LogLevel.ERROR);

describe("CacheBase", () => {
  let cache: MockCache;
  let entity: MockEntity;

  beforeEach(() => {
    cache = new MockCache({
      logger,
      port: 1,
    });
    entity = new MockEntity({
      name: "name",
    });
  });

  test("should set entity", async () => {
    await expect(cache.set(entity)).resolves.toMatchSnapshot();
    expect(mockSet).toHaveBeenCalledWith(
      "e397bc49-849e-4df6-a536-7b9fa3574ace",
      { created: date, id: "e397bc49-849e-4df6-a536-7b9fa3574ace", name: "name", updated: date, version: 0 },
      null,
    );
  });

  test("should set entity with expiry", async () => {
    cache = new MockCache({
      expiresInSeconds: 100,
      logger,
      port: 1,
    });

    await expect(cache.set(entity)).resolves.toMatchSnapshot();
    expect(mockSet).toHaveBeenCalledWith(
      "e397bc49-849e-4df6-a536-7b9fa3574ace",
      { created: date, id: "e397bc49-849e-4df6-a536-7b9fa3574ace", name: "name", updated: date, version: 0 },
      100,
    );
  });

  test("should get entity", async () => {
    await expect(cache.get("key")).resolves.toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledWith("key");
  });

  test("should delete entity", async () => {
    await expect(cache.del(entity)).resolves.toBe(undefined);
    expect(mockDel).toHaveBeenCalledWith("e397bc49-849e-4df6-a536-7b9fa3574ace");
  });
});
