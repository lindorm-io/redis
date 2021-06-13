# @lindorm-io/redis
Redis and Cache tools lindorm.io packages

## Installation
```shell script
npm install --save @lindorm-io/redis
```

## Usage

### Redis Client
```typescript
const redis = new RedisConnection({
  type: RedisConnectionType.CACHE,
  port: 6379,
});

await redis.connect();
const client = redis.client();

await client.set("key", { blobify: "data" });
const data = await client.get("key");
await client.del("key");

await redis.disconnect();
```

### Cache

```typescript
export class EntityCache extends CacheBase<EntityAttributes, Entity> {
  public constructor(options: CacheOptions) {
    super({
      ...options,
      entityName: "Entity",
    });
  }

  protected createEntity(data: EntityAttributes): Entity {
    return new Entity(data);
  }
}

const cache = new EntityCache({
  client,
  expiresInSeconds : 100,
  port : 6379,
  logger, // "@lindorm-io/winston" logger
});

await cache.create(entity);
await cache.update(entity);
const entity = await cache.find("key");
await cache.remove(entity);
```
