import redis from "redis";
import { TObject, TPromise } from "@lindorm-io/core";
import { isNumber } from "lodash";
import { parseBlob, stringifyBlob } from "../util";
import { promisify } from "util";

export interface IRedisClientOptions {
  port: number;
}

export class RedisClient {
  private asyncDel: TPromise<number>;
  private asyncGet: TPromise<string>;
  private asyncKeys: TPromise<string>;
  private asyncSet: TPromise<string>;
  private asyncSetEx: TPromise<string>;

  constructor(options: IRedisClientOptions) {
    const client = redis.createClient(options.port);

    this.asyncDel = promisify(client.del).bind(client);
    this.asyncGet = promisify(client.get).bind(client);
    this.asyncKeys = promisify(client.keys).bind(client);
    this.asyncSet = promisify(client.set).bind(client);
    this.asyncSetEx = promisify(client.setex).bind(client);
  }

  public async set(key: string, value: TObject<any>, expiresInSeconds?: number): Promise<string> {
    let result: string;

    if (isNumber(expiresInSeconds)) {
      result = await this.asyncSetEx(key, expiresInSeconds, stringifyBlob(value));
    } else {
      result = await this.asyncSet(key, stringifyBlob(value));
    }

    return result;
  }

  public async get(key: string): Promise<TObject<any>> {
    return parseBlob(await this.asyncGet(key));
  }

  public async getAll(pattern: string): Promise<Array<TObject<any>>> {
    const keys = await this.asyncKeys(pattern);
    const array: Array<TObject<any>> = [];

    for (const key of keys) {
      array.push(await this.get(key));
    }

    return array;
  }

  public async del(key: string): Promise<number> {
    return this.asyncDel(key);
  }
}
