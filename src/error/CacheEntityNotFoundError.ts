import { ExtendableError } from "@lindorm-io/errors";

export class CacheEntityNotFoundError extends ExtendableError {
  public constructor(key: string, result: unknown) {
    super("Entity not found", {
      debug: { key, result },
    });
  }
}
