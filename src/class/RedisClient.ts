import redis from "redis";
import { IRedisClient, IRedisClientOptions, TPromise } from "../typing";
import { isNumber } from "lodash";
import { parseBlob, stringifyBlob } from "../util";
import { promisify } from "util";

export interface IAsyncClient {
  del: TPromise<number>;
  get: TPromise<string>;
  keys: TPromise<string>;
  quit: TPromise<string>;
  set: TPromise<string>;
  setEx: TPromise<string>;
}

export class RedisClient implements IRedisClient {
  private client: IAsyncClient;
  private port: number;

  constructor(options: IRedisClientOptions) {
    this.port = options.port;
  }

  public async connect(): Promise<void> {
    const client: redis.RedisClient = redis.createClient(this.port);

    this.client = {
      del: promisify(client.del).bind(client),
      get: promisify(client.get).bind(client),
      keys: promisify(client.keys).bind(client),
      quit: promisify(client.quit).bind(client),
      set: promisify(client.set).bind(client),
      setEx: promisify(client.setex).bind(client),
    };
  }

  public async quit(): Promise<string> {
    return this.client.quit();
  }

  public async set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string> {
    let result: string;

    if (isNumber(expiresInSeconds)) {
      result = await this.client.setEx(key, expiresInSeconds, stringifyBlob(value));
    } else {
      result = await this.client.set(key, stringifyBlob(value));
    }

    return result;
  }

  public async get(key: string): Promise<Record<string, any>> {
    return parseBlob(await this.client.get(key));
  }

  public async getAll(pattern: string): Promise<Array<Record<string, any>>> {
    const keys = await this.client.keys(pattern);
    const array: Array<Record<string, any>> = [];

    for (const key of keys) {
      array.push(await this.get(key));
    }

    return array;
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
