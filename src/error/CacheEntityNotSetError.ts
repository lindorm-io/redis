import { ExtendableError } from "@lindorm-io/errors";

export class CacheEntityNotSetError extends ExtendableError {
  constructor(key: string, result: string) {
    super("Unable to set Entity", {
      debug: { key, result },
    });
  }
}
