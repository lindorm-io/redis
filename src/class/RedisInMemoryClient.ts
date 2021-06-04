import { IRedisClient } from "../typing";
import { includes } from "lodash";
import { parseBlob, stringifyBlob } from "@lindorm-io/string-blob";

export class RedisInMemoryClient implements IRedisClient {
  public cache: Record<string, any>;

  public constructor(cache?: Record<string, any>) {
    this.cache = cache || {};
  }

  public async connect(): Promise<void> {
    return Promise.resolve();
  }

  public async quit(): Promise<string> {
    return Promise.resolve("OK");
  }

  public isConnected(): boolean {
    return true;
  }

  public async set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string> {
    this.cache[key] = { blob: stringifyBlob(value), expiresInSeconds };

    return Promise.resolve("OK");
  }

  public async get(key: string): Promise<Record<string, any> | undefined> {
    const data = this.cache[key];

    return Promise.resolve(data?.blob ? parseBlob(data.blob) : undefined);
  }

  public async getAll(pattern: string): Promise<Array<Record<string, any>>> {
    const array: Array<Record<string, any>> = [];
    const inMemoryPattern = pattern.replace(/\*/g, "");

    for (const key of Object.keys(this.cache)) {
      if (!includes(key, inMemoryPattern)) continue;
      const item = await this.get(key);
      if (item) array.push(item);
    }

    return Promise.resolve(array);
  }

  public async del(key: string): Promise<number> {
    this.cache[key] = undefined;

    return Promise.resolve(1);
  }
}
