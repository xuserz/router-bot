import * as r from "redis";

declare global {
  var redis: Redis;
}

class Redis {
  _redis: r.RedisClientType;

  constructor(url: string) {
    this._redis = r.createClient({ url: url })
    globalThis.redis = this;
  }

  get = (key: string) =>
    new Promise<string | undefined>(async (resolve) => {
      try {
        if (this._redis.isReady) {
          const result = await this._redis.get("router:" + key);
          resolve(result || undefined);
        }
        resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });

  set = (key: string, value: object | string) =>
    new Promise<boolean>(async (resolve) => {
      try {
        if (this._redis.isReady) {
          const data =
            typeof value === "string" ? value : JSON.stringify(value);
          await this._redis.set("router:" + key, data);
          resolve(true);
        }
        resolve(false);
      } catch {
        resolve(false);
      }
    });

  keys = (key: string) =>
    new Promise<string[]>(async (resolve) => {
      try {
        if (this._redis.isReady) {
          const result = await this._redis.keys("router:" + key);
          resolve(result);
        }
        resolve([]);
      } catch {
        resolve([]);
      }
    });

  setex = (key: string, seconds: number, value: object | string) =>
    new Promise<boolean>(async (resolve) => {
      try {
        if (this._redis.isReady) {
          const data =
            typeof value === "string" ? value : JSON.stringify(value);
          await this._redis.setEx("router:" + key, seconds, data);
          resolve(true);
        }
      } catch {
        resolve(false);
      }
    });

  init = async () => await this._redis.connect();
}

export default Redis;