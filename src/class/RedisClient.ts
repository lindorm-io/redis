import redis, { ClientOpts } from "redis";
import { IRedisClient, TPromise } from "../typing";
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
  private _client: IAsyncClient;
  private _clientOptions: ClientOpts;

  constructor(options: ClientOpts) {
    this._clientOptions = options;
  }

  public async connect(): Promise<void> {
    const client: redis.RedisClient = redis.createClient(this._clientOptions);

    this._client = {
      del: promisify(client.del).bind(client),
      get: promisify(client.get).bind(client),
      keys: promisify(client.keys).bind(client),
      quit: promisify(client.quit).bind(client),
      set: promisify(client.set).bind(client),
      setEx: promisify(client.setex).bind(client),
    };
  }

  public async quit(): Promise<string> {
    return this._client.quit();
  }

  public async set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string> {
    let result: string;

    if (isNumber(expiresInSeconds)) {
      result = await this._client.setEx(key, expiresInSeconds, stringifyBlob(value));
    } else {
      result = await this._client.set(key, stringifyBlob(value));
    }

    return result;
  }

  public async get(key: string): Promise<Record<string, any>> {
    return parseBlob(await this._client.get(key));
  }

  public async getAll(pattern: string): Promise<Array<Record<string, any>>> {
    const keys = await this._client.keys(pattern);
    const array: Array<Record<string, any>> = [];

    for (const key of keys) {
      array.push(await this.get(key));
    }

    return array;
  }

  public async del(key: string): Promise<number> {
    return this._client.del(key);
  }
}
