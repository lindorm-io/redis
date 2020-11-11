import { IRedisClientOptions } from "./RedisClient";
import { TObject } from "@lindorm-io/core";
import { includes } from "lodash";
import { parseBlob, stringifyBlob } from "../util";

export class RedisInMemoryClient {
  public store: TObject<any>;

  constructor(options: IRedisClientOptions) {
    this.store = {};
  }

  public async set(key: string, value: TObject<any>, expiresInSeconds?: number): Promise<string> {
    this.store[key] = { blob: stringifyBlob(value), expiresInSeconds };

    return "OK";
  }

  public async get(key: string): Promise<TObject<any>> {
    const data = this.store[key];

    return data?.blob ? parseBlob(data.blob) : undefined;
  }

  public async getAll(pattern: string): Promise<Array<TObject<any>>> {
    const array: Array<TObject<any>> = [];
    const inMemoryPattern = pattern.replace(/\*/g, "");

    for (const key of Object.keys(this.store)) {
      if (!includes(key, inMemoryPattern)) continue;
      array.push(await this.get(key));
    }

    return array;
  }

  public async del(key: string): Promise<number> {
    this.store[key] = undefined;
    return 1;
  }
}
