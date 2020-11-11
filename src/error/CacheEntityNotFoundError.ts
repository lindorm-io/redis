import { ExtendableError, TObject } from "@lindorm-io/core";

export class CacheEntityNotFoundError extends ExtendableError {
  constructor(key: string, result: TObject<any>) {
    super("Entity not found", {
      debug: { key, result },
    });
  }
}
