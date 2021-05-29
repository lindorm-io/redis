import { ExtendableError } from "@lindorm-io/errors";

export class CacheEntityNotFoundError extends ExtendableError {
  public constructor(key: string, result: any) {
    super("Entity not found", {
      debug: { key, result },
    });
  }
}
