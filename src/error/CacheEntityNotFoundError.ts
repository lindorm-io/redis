import { ExtendableError } from "@lindorm-io/errors";

export class CacheEntityNotFoundError extends ExtendableError {
  constructor(key: string, result: Record<string, any>) {
    super("Entity not found", {
      debug: { key, result },
    });
  }
}
