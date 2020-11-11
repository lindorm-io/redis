# @lindorm-io/redis
Redis and Cache tools lindorm.io packages

## Installation
```shell script
npm install --save @lindorm-io/redis
```

## Usage

### Redis Client
```typescript
const client = new RedisClient({
  port: 6379,
});

await client.set("key", { blobify: "data" });
const data = await client.get("key");
await client.del("key");
```

### Cache
```typescript
class EntityCache extends CacheBase implements ICache {}

const cache = new EntityCache({
  expiresInSeconds: 100,
  port: 6379,
  logger, // "@lindorm-io/winston" logger
});

await cache.set(entity);
const entity = await cache.get("key");
await cache.del(entity);
```
