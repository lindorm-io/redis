import { IRedisClient } from "../typing";
import { TObject } from "@lindorm-io/core";
import { includes } from "lodash";
import { parseBlob, stringifyBlob } from "../util";

export class RedisInMemoryClient implements IRedisClient {
  public cache: TObject<any>;

  constructor(cache?: TObject<any>) {
    this.cache = cache || {};
  }

  public async connect(): Promise<void> {
    return Promise.resolve();
  }

  public async quit(): Promise<string> {
    return Promise.resolve("OK");
  }

  public async set(key: string, value: TObject<any>, expiresInSeconds?: number): Promise<string> {
    this.cache[key] = { blob: stringifyBlob(value), expiresInSeconds };

    return Promise.resolve("OK");
  }

  public async get(key: string): Promise<TObject<any>> {
    const data = this.cache[key];

    return Promise.resolve(data?.blob ? parseBlob(data.blob) : undefined);
  }

  public async getAll(pattern: string): Promise<Array<TObject<any>>> {
    const array: Array<TObject<any>> = [];
    const inMemoryPattern = pattern.replace(/\*/g, "");

    for (const key of Object.keys(this.cache)) {
      if (!includes(key, inMemoryPattern)) continue;
      array.push(await this.get(key));
    }

    return Promise.resolve(array);
  }

  public async del(key: string): Promise<number> {
    this.cache[key] = undefined;

    return Promise.resolve(1);
  }
}
