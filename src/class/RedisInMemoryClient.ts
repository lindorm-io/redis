import { IRedisClientOptions } from "./RedisClient";
import { TObject } from "@lindorm-io/core";
import { parseBlob, stringifyBlob } from "../util";

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

  public async del(key: string): Promise<void> {
    if (!this.store[key]) {
      throw new Error("Key not found");
    }

    this.store[key] = undefined;
  }
}
