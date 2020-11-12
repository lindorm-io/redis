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
const client = redis.getClient();

await client.set("key", { blobify: "data" });
const data = await client.get("key");
await client.del("key");

await redis.disconnect();
```

### Cache
```typescript
class EntityCache extends CacheBase implements ICache {}

const cache = new EntityCache({
  client,
  expiresInSeconds: 100,
  port: 6379,
  logger, // "@lindorm-io/winston" logger
});

await cache.set(entity);
const entity = await cache.get("key");
await cache.del(entity);
```
