import redis, { ClientOpts } from "redis";
import { ClientInitialisationError } from "../error";
import { IRedisClient, TPromise } from "../typing";
import { isNumber } from "lodash";
import { parseBlob, stringifyBlob } from "@lindorm-io/string-blob";
import { promisify } from "util";

export interface IAsyncClient {
  del: TPromise<number>;
  get: TPromise<string | null>;
  keys: TPromise<Array<string>>;
  quit: TPromise<string>;
  set: TPromise<unknown>;
  setEx: TPromise<string>;
}

export class RedisClient implements IRedisClient {
  private _client: IAsyncClient | undefined;
  private readonly clientOptions: ClientOpts;

  public constructor(options: ClientOpts) {
    this.clientOptions = options;
    this._client = undefined;
  }

  public async connect(): Promise<void> {
    const client: redis.RedisClient = redis.createClient(this.clientOptions);

    this._client = {
      del: promisify(client.del).bind(client),
      get: promisify(client.get).bind(client),
      keys: promisify(client.keys).bind(client),
      quit: promisify(client.quit).bind(client),
      set: promisify(client.set).bind(client),
      setEx: promisify(client.setex).bind(client),
    };
  }

  public async quit(): Promise<string | undefined> {
    if (!this._client) {
      throw new ClientInitialisationError();
    }

    return this._client.quit();
  }

  public async set(key: string, value: Record<string, any>, expiresInSeconds?: number): Promise<string | unknown> {
    if (!this._client) {
      throw new ClientInitialisationError();
    }

    let result: string | unknown;

    if (isNumber(expiresInSeconds)) {
      result = await this._client.setEx(key, expiresInSeconds, stringifyBlob(value));
    } else {
      result = await this._client.set(key, stringifyBlob(value));
    }

    return result;
  }

  public async get(key: string): Promise<Record<string, any> | undefined> {
    if (!this._client) {
      throw new ClientInitialisationError();
    }

    const result = await this._client.get(key);

    if (result) {
      return parseBlob(result);
    }
  }

  public async getAll(pattern: string): Promise<Array<Record<string, any>>> {
    if (!this._client) {
      throw new ClientInitialisationError();
    }

    const keys = await this._client.keys(pattern);
    const array: Array<Record<string, any>> = [];

    for (const key of keys) {
      const item = await this.get(key);
      if (item) array.push(item);
    }

    return array;
  }

  public async del(key: string): Promise<number> {
    if (!this._client) {
      throw new ClientInitialisationError();
    }

    return this._client.del(key);
  }
}
