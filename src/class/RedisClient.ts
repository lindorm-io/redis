import redis from "redis";
import { TObject, TPromise } from "@lindorm-io/core";
import { isNumber } from "lodash";
import { parseBlob, stringifyBlob } from "../util";
import { promisify } from "util";

export interface IRedisClientOptions {
  port: number;
}

export class RedisClient {
  private asyncGet: TPromise<string>;
  private asyncSet: TPromise<string>;
  private asyncSetEx: TPromise<string>;
  private asyncDel: TPromise<number>;

  constructor(options: IRedisClientOptions) {
    const client = redis.createClient(options.port);

    this.asyncGet = promisify(client.get).bind(client);
    this.asyncSet = promisify(client.set).bind(client);
    this.asyncSetEx = promisify(client.setex).bind(client);
    this.asyncDel = promisify(client.del).bind(client);
  }

  public async set(key: string, value: TObject<any>, expiresInSeconds?: number): Promise<void> {
    let result: string;

    if (isNumber(expiresInSeconds)) {
      result = await this.asyncSetEx(key, expiresInSeconds, stringifyBlob(value));
    } else {
      result = await this.asyncSet(key, stringifyBlob(value));
    }

    if (result !== "OK") {
      throw new Error("Erroneous result");
    }
  }

  public async get(key: string): Promise<TObject<any>> {
    return parseBlob(await this.asyncGet(key));
  }

  public async del(key: string): Promise<void> {
    const deletedRows = await this.asyncDel(key);

    if (deletedRows === 0) {
      throw new Error("Key not found");
    }
  }
}
