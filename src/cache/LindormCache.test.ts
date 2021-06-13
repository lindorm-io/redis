import Joi from "joi";
import MockDate from "mockdate";
import { LindormCache } from "./LindormCache";
import {
  EntityAttributes,
  EntityCreationError,
  EntityOptions,
  ILindormEntity,
  JOI_ENTITY_BASE,
  LindormEntity,
} from "@lindorm-io/entity";
import { RedisConnection } from "../infrastructure";
import { RedisConnectionType } from "../enum";
import { CacheOptions } from "../typing";
import { logger } from "../test";
import { RedisClient } from "../class";

MockDate.set("2020-01-01T08:00:00.000Z");

interface ITestEntityAttributes extends EntityAttributes {
  name: string;
  hasCreatedFunctionBeenCalled: boolean;
}

interface ITestEntityOptions extends EntityOptions {
  name: string;
  hasCreatedFunctionBeenCalled?: boolean;
}

interface ITestEntity extends ILindormEntity<ITestEntityAttributes> {}

const schema = Joi.object({
  ...JOI_ENTITY_BASE,
  name: Joi.string().required(),
  hasCreatedFunctionBeenCalled: Joi.boolean().required(),
});

class TestEntity extends LindormEntity<ITestEntityAttributes> implements ITestEntity {
  public name: string;
  public hasCreatedFunctionBeenCalled: boolean;

  constructor(options: ITestEntityOptions) {
    super(options);
    this.name = options.name;
    this.hasCreatedFunctionBeenCalled = options.hasCreatedFunctionBeenCalled || false;
  }

  create() {
    if (this.hasCreatedFunctionBeenCalled) {
      throw new EntityCreationError("TestEntity");
    }
    this.hasCreatedFunctionBeenCalled = true;
  }

  getKey() {
    return this.id;
  }

  async schemaValidation() {
    await schema.validateAsync(this.toJSON());
  }

  toJSON() {
    return {
      ...this.defaultJSON(),
      name: this.name,
      hasCreatedFunctionBeenCalled: this.hasCreatedFunctionBeenCalled,
    };
  }
}

class TestCache extends LindormCache<ITestEntityAttributes, TestEntity> {
  constructor(options: CacheOptions) {
    super({
      ...options,
      entityName: "mock",
    });
  }

  protected createEntity(data: ITestEntityAttributes): TestEntity {
    return new TestEntity(data);
  }
}

describe("LindormCache", () => {
  let inMemoryCache: Record<string, any>;
  let redis: RedisConnection;
  let client: RedisClient;
  let cache: TestCache;
  let entity: TestEntity;

  beforeEach(async () => {
    inMemoryCache = {};

    redis = new RedisConnection({
      type: RedisConnectionType.MEMORY,
      port: 1,
      inMemoryCache,
    });

    await redis.connect();
    client = redis.client();

    cache = new TestCache({ logger, client });
    entity = new TestEntity({
      id: "10192b05-6d39-4a2d-907a-32318fda8cb9",
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
    await expect(cache.create(entity, 999)).resolves.toMatchSnapshot();

    expect(inMemoryCache).toMatchSnapshot();
  });

  test("should create entity with expiry", async () => {
    cache = new TestCache({ client, expiresInSeconds: 100, logger });

    await expect(cache.create(entity)).resolves.toMatchSnapshot();

    expect(inMemoryCache).toMatchSnapshot();
  });

  test("should find entity", async () => {
    await cache.create(entity);

    await expect(cache.find(entity.id)).resolves.toMatchSnapshot();
  });

  test("should update entity", async () => {
    await cache.create(entity);

    entity.name = "new name";

    await expect(cache.update(entity)).resolves.toMatchSnapshot();
  });

  test("should find all entities", async () => {
    await cache.create(
      new TestEntity({
        id: "5a8c3582-0a5f-4af8-b393-ac95d65284ee",
        name: "one",
      }),
    );
    await cache.create(
      new TestEntity({
        id: "a9afb688-b9c0-42ce-9fe2-1e2f76fee036",
        name: "two",
      }),
    );

    await expect(cache.findAll()).resolves.toMatchSnapshot();
  });

  test("should find many entities", async () => {
    await cache.create(
      new TestEntity({
        id: "0868b84c-ba82-49b2-968e-eba9c02286dd",
        name: "one",
      }),
    );
    await cache.create(
      new TestEntity({
        id: "712606fb-f371-44fe-b6b0-0aa6807950d8",
        name: "two",
      }),
    );
    await cache.create(
      new TestEntity({
        id: "8e84c5b7-f1fa-4c73-a342-2da513ffa1df",
        name: "two",
      }),
    );

    await expect(cache.findMany({ name: "two" })).resolves.toMatchSnapshot();
  });

  test("should remove entity", async () => {
    await cache.create(entity);

    await expect(cache.remove(entity)).resolves.toBeUndefined();

    expect(inMemoryCache).toMatchSnapshot();
  });
});
