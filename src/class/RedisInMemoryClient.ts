import { IRedisClientOptions } from "./RedisClient";
import { TObject } from "@lindorm-io/core";
import { parseBlob, stringifyBlob } from "../util";
import { includes } from "lodash";

export class RedisInMemoryClient {
  public store: TObject<any>;

  constructor(options: IRedisClientOptions) {
    this.store = {};
  }

  public async set(key: string, value: TObject<any>, expiresInSeconds?: number): Promise<void> {
    this.store[key] = { blob: stringifyBlob(value), expiresInSeconds };
  }

  public async get(key: string): Promise<TObject<any>> {
    const data = this.store[key];

    if (!data) {
      throw new Error("Key not found");
    }

    return parseBlob(data.blob);
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

  public async del(key: string): Promise<void> {
    if (!this.store[key]) {
      throw new Error("Key not found");
    }

    this.store[key] = undefined;
  }
}
